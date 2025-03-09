import { Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel, TypeORMDataSourceManager } from '@midwayjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { BaseService } from '../../base/base.service';
import {
  BabyCreateDTO,
  BabyDTO,
  BabyListDTO,
  BabyPageDTO,
  BabyUpdateDTO,
} from '../dto/baby.dto';
import { Baby } from '../entity/baby';
import { BabyFamily } from '../entity/babyFamily';
import { AccountBabyFamily } from '../entity/accountBabyFamily';

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
    let familyList = await this.accountBabyFamilyModel.find({
      where: { userId: dto.userId },
    });
    let familyIds = familyList.map(family => family.id);
    const list = await this.babyModel.find({
      where: { familyId: In(familyIds) },
    });
    return list;
  }
  async info(id: number) {
    const info = await this.babyModel.findOne({ where: { id } });
    return info;
  }

  async create(dto: BabyCreateDTO) {
    let { userId, familyId, ...baby } = dto;

    const dataSource = this.dataSourceMgr.getDataSource('default');
    const res = await dataSource.transaction(async transMgr => {
      //没有家庭id,先创建家庭
      if (!familyId) {
        const { id } = await transMgr.save(BabyFamily, {
          name: userId + '的家庭',
        });
        familyId = id;
      }
      return await Promise.all([
        transMgr.save(AccountBabyFamily, { userId, familyId, role: 10 }),
        transMgr.save(Baby, { familyId, ...baby }),
      ]);
    });
    return res?.[1];
  }

  async update(upDto: BabyUpdateDTO) {
    return await this.babyModel.update(upDto.id, upDto);
  }

  async delete(id: number) {
    return await this.babyModel.delete(id);
  }
}
