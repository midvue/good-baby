import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { BaseService } from '../../base/base.service';
import {
  BabyFamilyCreateDTO,
  BabyFamilyDTO,
  BabyFamilyIdDTO,
  BabyFamilyListDTO,
  BabyFamilyPageDTO,
  BabyFamilyUpdateDTO,
} from '../dto/babyFamily.dto';
import { BabyFamily } from '../entity/babyFamily';
import { AccountBabyFamily } from '../entity/accountBabyFamily';

@Provide()
export class BabyFamilyService extends BaseService {
  @InjectEntityModel(BabyFamily)
  babyFamilyModel: Repository<BabyFamily>;

  @InjectEntityModel(AccountBabyFamily)
  accountBabyFamilyModel: Repository<AccountBabyFamily>;

  async page(options: Partial<BabyFamilyPageDTO>) {
    const { id, name } = options;

    const where = {
      id,
      name: name ? Like(name + '%') : undefined,
    };

    const [list, count] = await this.babyFamilyModel.findAndCount({
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

  async list(options: BabyFamilyListDTO) {
    const { name } = options || {};
    let familyIds = await this.accountBabyFamilyModel.find({
      select: ['familyId'],
      where: { userId: options.userId },
    });
    const list = await this.babyFamilyModel.find({
      where: {
        id: In(familyIds.map(item => item.familyId)),
        name: name ? Like(name + '%') : undefined,
      },
    });
    return list;
  }
  async info(id: string) {
    const info = await this.babyFamilyModel.findOne({ where: { id } });
    return info;
  }

  /** 获取家庭关联信息 */
  async relation(dto: BabyFamilyIdDTO) {
    const list = await this.accountBabyFamilyModel.find({
      where: { familyId: dto.id },
    });
    return list;
  }

  async create(inDto: BabyFamilyCreateDTO) {
    const { id } = await this.babyFamilyModel.save(
      Object.assign(new BabyFamily(), inDto)
    );
    return { id };
  }

  async update(upDto: BabyFamilyUpdateDTO) {
    return await this.babyFamilyModel.update(upDto.id, upDto);
  }

  async delete(id: number) {
    return await this.babyFamilyModel.delete(id);
  }
}
