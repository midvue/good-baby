import { Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel, TypeORMDataSourceManager } from '@midwayjs/typeorm';
import { In, Repository } from 'typeorm';
import { BaseService } from '../../base/base.service';
import { MenuService } from './menu.service';
import { Role } from '../entity/role';
import { RoleMenu } from '../entity/roleMenu';
import { httpCode } from '../../../constants/code.constants';
import {
  RoleCreateDTO,
  RoleMenuUpDTO,
  RolePageDTO,
  RoleUpdateDTO,
  RoleUpStatusDTO,
} from '../dto/role.dto';

@Provide()
export class RoleService extends BaseService {
  @InjectEntityModel(Role)
  roleModel: Repository<Role>;

  @InjectEntityModel(RoleMenu)
  roleMenuModel: Repository<RoleMenu>;

  @Inject()
  dataSourceMgr: TypeORMDataSourceManager;

  @Inject()
  menuService: MenuService;

  async page(uid: number, options: Partial<RolePageDTO>) {
    const { id, status, pid } = options;

    const where = {
      id,
      status,
      pid: pid || uid,
    };

    const results = await this.roleModel.findAndCount({
      select: [
        'id',
        'name',
        'pid',
        'code',
        'order',
        'status',
        'remark',
        'createTime',
        'updateTime',
      ],
      where,
      order: {
        id: 'ASC',
      },
      skip: (options.current - 1) * options.size,
      take: options.size,
    });

    return { list: results[0], count: results[1] };
  }

  async info(id: number) {
    if (!id) return this.commError(httpCode.CODE_1000);
    const info = await this.roleModel.findOne({ where: { id } });
    return info;
  }

  async create(inDto: RoleCreateDTO) {
    return await this.roleModel.save(inDto);
  }

  async update(upDto: RoleUpdateDTO) {
    return await this.roleModel.update(upDto.id, upDto);
  }

  async delete(id: number) {
    return await this.roleModel.delete(id);
  }

  async list() {
    const info = await this.roleModel.find({
      select: ['id', 'name', 'pid'],
    });
    return info;
  }

  async updateStatus(role: RoleUpStatusDTO) {
    return await this.roleModel.update(role.id, role);
  }

  async roleMenuPermit(roleId: number) {
    const listQuery = this.menuService.list({});

    const idsQuery = this.roleMenuModel
      .find({ select: ['menuId'], where: { roleId } })
      .then(menus => menus.map(menu => menu.menuId));

    const [menuInfo, menuIds] = await Promise.all([listQuery, idsQuery]);
    return { list: menuInfo.list, menuIds };
  }

  //角色分配权限
  async updateMenuPermit(dto: RoleMenuUpDTO) {
    const { roleId, menuIds } = dto;
    //查询已有的菜单
    const oldMenuIds = await this.roleMenuModel
      .find({ select: ['menuId'], where: { roleId } })
      .then(menus => menus.map(menu => menu.menuId));

    //过滤掉库已经有的,收集库里没有的
    const roleMenus = [] as Partial<RoleMenu>[];
    for (const mid of menuIds) {
      const index = oldMenuIds.indexOf(mid);
      if (index === -1) {
        roleMenus.push({ menuId: mid, roleId });
      } else {
        oldMenuIds.splice(index, 1);
      }
    }

    const dataSource = this.dataSourceMgr.getDataSource('default');
    return await dataSource.transaction(async transMgr => {
      //数据库没有的,就添加
      const insertExec = transMgr.insert(RoleMenu, roleMenus);
      //数据库中冗余的,删除
      const deleteExec = transMgr.delete(RoleMenu, {
        roleId,
        menuId: In(oldMenuIds),
      });
      return await Promise.all([insertExec, deleteExec]);
    });
  }
}
