import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Like, Repository } from 'typeorm';
import { BaseService } from '../../base/base.service';
import {
  BabyFamilyCreateDTO,
  BabyFamilyDTO,
  BabyFamilyPageDTO,
  BabyFamilyUpdateDTO,
} from '../dto/babyFamily.dto';
import { BabyFamily } from '../entity/babyFamily';

@Provide()
export class BabyFamilyService extends BaseService {
  @InjectEntityModel(BabyFamily)
  babyFamilyModel: Repository<BabyFamily>;

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

  async list(options: BabyFamilyDTO) {
    const { id, name } = options || {};
    const list = await this.babyFamilyModel.find({
      where: { id, name: name ? Like(name + '%') : undefined },
    });
    return { list };
  }
  async info(id: number) {
    const info = await this.babyFamilyModel.findOne({ where: { id } });
    return info;
  }

  async create(inDto: BabyFamilyCreateDTO) {
    const { id } = await this.babyFamilyModel.save(inDto);
    return { id };
  }

  async update(upDto: BabyFamilyUpdateDTO) {
    return await this.babyFamilyModel.update(upDto.id, upDto);
  }

  async delete(id: number) {
    return await this.babyFamilyModel.delete(id);
  }
}
