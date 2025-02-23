import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { BaseService } from '../../base/base.service';
import {
  MenuCreateDTO,
  MenuDTO,
  MenuPageDTO,
  MenuUpdateDTO,
} from '../dto/menu.dto';
import { Menu } from '../entity/menu';
import { RoleMenu } from '../entity/roleMenu';

@Provide()
export class MenuService extends BaseService {
  @InjectEntityModel(Menu)
  menuModel: Repository<Menu>;

  @InjectEntityModel(Menu)
  roleMenuModel: Repository<RoleMenu>;

  async page(options: Partial<MenuPageDTO>) {
    const { id, name, type, pid } = options;

    const where = {
      id,
      pid,
      type,
      name: name ? Like(name + '%') : undefined,
    };

    const [list, count] = await this.menuModel.findAndCount({
      select: [
        'id',
        'name',
        'pid',
        'code',
        'icon',
        'orderNum',
        'url',
        'type',
        'keepAlive',
        'isShow',
        'createTime',
        'updateTime',
      ],
      where,
      order: {
        id: 'DESC',
        createTime: 'DESC',
      },
      skip: (options.current - 1) * options.size,
      take: options.size,
    });

    return { list, count };
  }

  async list(options: Partial<MenuDTO>) {
    const { type, pid } = options || {};
    const list = await this.menuModel.find({
      select: ['id', 'name', 'pid', 'code', 'icon', 'orderNum'],
      where: { type, pid },
    });
    return { list };
  }

  async listByRole(options) {
    const { roleIds } = options || {};
    console.log('角色', roleIds);

    const list = await this.menuModel
      .createQueryBuilder('a')
      .select(
        ` 
        a.id,
        a.pid,
        a.name,
        a.code,
        a.icon,
        a.type,
        a.url,
        a.is_show AS isShow,
        a.keep_alive AS keepAlive,
        a.order_num AS orderNum `
      )
      .innerJoin(RoleMenu, 'b', 'a.id =b.menuId')
      .where('b.roleId In (:ids)', { ids: roleIds })
      .groupBy('a.id')
      .getRawMany();

    return { list };
  }

  async info(id: number) {
    const info = await this.menuModel.findOne({ where: { id } });
    return info;
  }

  async create(inDto: MenuCreateDTO) {
    const { id } = await this.menuModel.save(inDto);
    return { id };
  }

  async update(upDto: MenuUpdateDTO) {
    return await this.menuModel.update(upDto.id, upDto);
  }

  async delete(id: number) {
    return await this.menuModel.delete(id);
  }

  /**
   * 批量插入
   */
  async batchCreate(inDtos: Array<MenuCreateDTO>) {
    const { raw } = await this.menuModel.insert(inDtos);
    return raw;
  }
}
