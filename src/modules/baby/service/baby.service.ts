import { EnumYesNoPlus, useDate } from '@mid-vue/shared';
import { Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel, TypeORMDataSourceManager } from '@midwayjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { BaseService } from '../../base/base.service';
import {
  BabyCreateDTO,
  BabyListDTO,
  BabyPageDTO,
  BabyUpdateDTO,
} from '../dto/baby.dto';
import { AccountBabyFamily } from '../entity/accountBabyFamily';
import { Baby } from '../entity/baby';
import { BabyFamily } from '../entity/babyFamily';

@Provide()
export class BabyService extends BaseService {
  @InjectEntityModel(Baby)
  babyModel: Repository<Baby>;

  @InjectEntityModel(BabyFamily)
  babyFamilyModel: Repository<BabyFamily>;

  @InjectEntityModel(AccountBabyFamily)
  accountBabyFamilyModel: Repository<AccountBabyFamily>;

  @Inject()
  dataSourceMgr: TypeORMDataSourceManager;

  async page(options: Partial<BabyPageDTO>) {
    const { id, nickname, birthTime } = options;

    const where = {
      id,
      birthTime,
      nickname: nickname ? Like(nickname + '%') : undefined,
    };

    const [list, count] = await this.babyModel.findAndCount({
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

  async list(dto: BabyListDTO) {
    const list = await this.accountBabyFamilyModel
      .createQueryBuilder('a')
      .innerJoin(Baby, 'b', 'a.familyId = b.familyId')
      .where('a.userId = :userId', { userId: dto.userId })
      .select([
        'a.relation AS relation',
        'a.role AS role',
        'a.familyId AS familyId',
        'b.id AS id',
        'b.nickname AS nickname',
        'b.avatar AS avatar',
        'b.gender AS gender',
        'b.height AS height',
        'b.weight AS weight',
        'b.birthDate AS birthDate',
        'b.birthTime AS birthTime',
      ])
      .getRawMany();
    return list;
  }
  async info(id: string) {
    const info = await this.babyModel.findOne({ where: { id } });
    return info;
  }

  /** 添加协助喂养人 */
  async addFoster(dto: BabyCreateDTO) {
    const res = await this.accountBabyFamilyModel.findOne({
      select: ['familyId'],
      where: {
        userId: dto.userId,
      },
    });
    if (res && res?.familyId === dto.familyId) {
      return this.commError('您已经加入该家庭');
    }
    const { id } = await this.accountBabyFamilyModel.save({
      ...dto,
      role: EnumYesNoPlus.NO,
    });

    return { id };
  }

  async create(dto: BabyCreateDTO) {
    const { userId, relation, ...baby } = dto;

    const dataSource = this.dataSourceMgr.getDataSource('default');
    const res = await dataSource.transaction(async transMgr => {
      // 先查询是否有自己创建的家庭
      let { familyId } =
        (await transMgr.findOne(AccountBabyFamily, {
          select: ['familyId'],
          where: {
            userId,
            role: EnumYesNoPlus.YES,
          },
        })) || {};
      //没有家庭id,先创建家庭
      if (!familyId) {
        const { id } = await transMgr.save(
          BabyFamily,
          Object.assign(new BabyFamily(), { name: baby.nickname })
        );
        familyId = id;
        transMgr.save(AccountBabyFamily, {
          userId,
          familyId,
          role: EnumYesNoPlus.YES,
          relation,
        });
      }
      return await transMgr.save(
        Baby,
        Object.assign(new Baby(), { ...baby, familyId })
      );
    });
    return res;
  }

  async update(upDto: BabyUpdateDTO) {
    const userId = this.ctx.uid;
    const { relation, ...babyDto } = upDto;

    //根据userId我当前的关系
    const selfInfo = await this.accountBabyFamilyModel.findOne({
      select: ['id', 'relation', 'userId', 'role', 'familyId'],
      where: {
        userId,
        role: EnumYesNoPlus.YES,
      },
    });
    // 校验是否是创建人
    if (selfInfo.familyId !== babyDto.familyId) {
      return this.commError('您不是创建人 ,无法更新宝宝信息');
    }

    // 查询目标关系对应的信息
    const otherInfo = await this.accountBabyFamilyModel.findOne({
      select: ['id', 'relation', 'userId', 'role'],
      where: {
        familyId: babyDto.familyId,
        /** 查询目标关系是否有用户 */
        relation,
      },
    });

    // 获取自己是否创建者,创建者才能更新宝宝信息
    const dataSource = this.dataSourceMgr.getDataSource('default');
    const res = await dataSource.transaction(async transMgr => {
      // 如果修改关系,则互换爸妈的角色
      if (selfInfo.relation !== relation) {
        // 如果目标关系有用户,则互换角色
        if (otherInfo?.id) {
          transMgr.update(AccountBabyFamily, otherInfo.id, {
            ...otherInfo,
            relation: selfInfo.relation,
          });
        }
        // 修改自己的关系
        transMgr.update(AccountBabyFamily, selfInfo.id, {
          ...selfInfo,
          relation,
        });
      }
      return await transMgr.update(Baby, upDto.id, babyDto);
    });

    return res;
  }

  async delete(id: string) {
    return await this.babyModel.delete(id);
  }
}
