import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Like, Repository } from 'typeorm';
import { BaseService } from '../../base/base.service';
import {
  BabyCreateDTO,
  BabyDTO,
  BabyPageDTO,
  BabyUpdateDTO,
} from '../dto/baby.dto';
import { Baby } from '../entity/baby';

@Provide()
export class BabyService extends BaseService {
  @InjectEntityModel(Baby)
  babyModel: Repository<Baby>;

  async page(options: Partial<BabyPageDTO>) {
    const { id, name, code } = options;

    const where = {
      id,
      code,
      name: name ? Like(name + '%') : undefined,
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

  async info(id: number) {
    const info = await this.babyModel.findOne({ where: { id } });
    return info;
  }

  async create(inDto: BabyCreateDTO) {
    const { id } = await this.babyModel.save(inDto);
    return { id };
  }

  async update(upDto: BabyUpdateDTO) {
    return await this.babyModel.update(upDto.id, upDto);
  }

  async delete(id: number) {
    return await this.babyModel.delete(id);
  }
}
