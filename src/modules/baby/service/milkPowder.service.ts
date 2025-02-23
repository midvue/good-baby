import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Like, Repository } from 'typeorm';
import { BaseService } from '../../base/base.service';
import {
  MilkPowderCreateDTO,
  MilkPowderPageDTO,
  MilkPowderUpdateDTO,
} from '../dto/milkPowder.dto';
import { MilkPowder } from '../entity/milkPowder';

@Provide()
export class MilkPowderService extends BaseService {
  @InjectEntityModel(MilkPowder)
  milkPowderModel: Repository<MilkPowder>;

  async page(options: Partial<MilkPowderPageDTO>) {
    const { id, name, code } = options;

    const where = {
      id,
      code,
      name: name ? Like(name + '%') : undefined,
    };

    const [list, count] = await this.milkPowderModel.findAndCount({
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

  async info(id: number) {
    const info = await this.milkPowderModel.findOne({ where: { id } });
    return info;
  }

  async create(inDto: MilkPowderCreateDTO) {
    const { id } = await this.milkPowderModel.save(inDto);
    return { id };
  }

  async update(upDto: MilkPowderUpdateDTO) {
    return await this.milkPowderModel.update(upDto.id, upDto);
  }

  async delete(id: number) {
    return await this.milkPowderModel.delete(id);
  }
}
