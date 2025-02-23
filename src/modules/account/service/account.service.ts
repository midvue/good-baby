import { Inject, Provide, httpError } from '@midwayjs/core';
import { JwtService } from '@midwayjs/jwt';
import { InjectEntityModel, TypeORMDataSourceManager } from '@midwayjs/typeorm';
import { In, Repository } from 'typeorm';
import { BaseService } from '../../base/base.service';
import {
  AccountCreateDTO,
  AccountPageDTO,
  AccountUpdateDTO,
} from '../dto/account.dto';
import { Account } from '../entity/account';

@Provide()
export class AccountService extends BaseService {
  @InjectEntityModel(Account)
  userModel: Repository<Account>;

  @Inject()
  jwtService: JwtService;

  @Inject()
  dataSourceMgr: TypeORMDataSourceManager;

  async page(options: Partial<AccountPageDTO>) {
    const { id, account } = options;

    let qBuilder = this.userModel.createQueryBuilder('a').select(
      ` 
        a.id,
        a.account,
        a.phone,
        a.status,
        a.remark,
        a.gender,
        a.nickname,
        a.password,
        a.dept_id AS deptId,
        a.create_time AS createTime,
        a.update_time AS updateTime,
        `
    );
    if (id) {
      qBuilder = qBuilder.where('a.id = :id', { id });
    }
    if (account) {
      qBuilder = qBuilder.where('a.account like :account', {
        account: account + '%',
      });
    }
    qBuilder = qBuilder
      .groupBy('a.id')
      .orderBy({
        'a.id': 'ASC',
      })
      .skip((options.current - 1) * options.size)
      .take(options.size);

    const [list, count] = await Promise.all([
      qBuilder.getRawMany(),
      qBuilder.getCount(),
    ]);
    return { list, count };
  }

  async info(id: number) {
    if (!id) return {};
    const findUse = this.userModel.findOne({
      select: [
        'id',
        'account',
        'nickname',
        'phone',
        'deptId',
        'status',
        'gender',
        'createTime',
        'updateTime',
      ],
      where: { id },
    });

    const findRoles = this.roleModel
      .createQueryBuilder('role')
      .select('role.id as roleId,role.name as roleName')
      .where(qb => {
        const subQuery = qb
          .subQuery()
          .select('ur.role_id')
          .from(AccountRole, 'ur')
          .where('ur.user_id = :uid', { uid: id })
          .getQuery();
        return 'role.id IN ' + subQuery;
      });

    const [info, roleList] = await Promise.all([
      findUse,
      findRoles.getRawMany(),
    ]);
    return { ...info, roles: roleList };
  }

  async create(inDto: AccountCreateDTO) {
    const { roleIds, ...user } = inDto;

    const dataSource = this.dataSourceMgr.getDataSource('default');
    const res = await dataSource.transaction(async transMgr => {
      //事务中插入
      const _user = await transMgr.save(Account, user);
      const userRoleModels = roleIds.map(rid => ({
        roleId: rid,
        userId: _user.id,
      }));
      return await transMgr.save(AccountRole, userRoleModels);
    });
    return res?.[0];
  }

  async update(dto: AccountUpdateDTO) {
    const { roleIds, ...user } = dto;

    //查询库里面绑定的roleIds
    const urIds = await this.userRoleModel
      .find({
        select: ['roleId'],
        where: { userId: user.id },
      })
      .then(_uRoles => _uRoles.map(ur => ur.roleId));

    const dataSource = this.dataSourceMgr.getDataSource('default');
    return await dataSource.transaction(async transMgr => {
      await transMgr.update(Account, user.id, user);

      for (const rid of roleIds) {
        //如果数据库没有对应的角色,就添加
        const index = urIds.indexOf(rid);
        if (index === -1) {
          transMgr.insert(AccountRole, { userId: user.id, roleId: rid });
        } else {
          //过滤掉数据库已经有的
          urIds.splice(index, 1);
        }
      }
      //删除库里冗余的角色
      await transMgr.delete(AccountRole, {
        userId: user.id,
        roleId: In(urIds),
      });
    });
  }

  async delete(id: number) {
    return await this.userModel.delete(id);
  }

  async getAccountByAccount(account: string) {
    if (!account) throw new httpError.ForbiddenError('username不能为空');
    const user = await this.userModel.findOne({
      select: ['id', 'deptId', 'status', 'password'],
      where: { account },
    });
    return user || ({} as Account);
  }
}
