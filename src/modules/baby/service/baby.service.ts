import { EnumYesNoPlus } from '@mid-vue/shared';
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
    let aFamilyList = await this.accountBabyFamilyModel.find({
      where: { userId: dto.userId },
    });
    let familyIds = aFamilyList.map(item => item.familyId);
    const list = await this.babyModel.find({
      where: { familyId: In(familyIds) },
    });
    return list;
  }
  async info(id: string) {
    const info = await this.babyModel.findOne({ where: { id } });
    return info;
  }

  /** 添加协助者 */
  async addFoster(dto: BabyCreateDTO) {
    const { id } = await this.accountBabyFamilyModel.save({
      ...dto,
      role: EnumYesNoPlus.NO,
    });

    return { id };
  }

  async create(dto: BabyCreateDTO) {
    let { userId, familyId, relation, ...baby } = dto;

    const dataSource = this.dataSourceMgr.getDataSource('default');
    const res = await dataSource.transaction(async transMgr => {
      //没有家庭id,先创建家庭
      if (!familyId) {
        let { id } = await transMgr.save(
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
    return await this.babyModel.update(upDto.id, upDto);
  }

  async delete(id: string) {
    return await this.babyModel.delete(id);
  }
}
