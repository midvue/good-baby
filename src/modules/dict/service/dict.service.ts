import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Like, Repository } from 'typeorm';
import { BaseService } from '../../base/base.service';
import {
  DictCreateDTO,
  DictDTO,
  DictPageDTO,
  DictUpdateDTO,
} from '../dto/dict.dto';
import { Dict } from '../entity/dict';

@Provide()
export class DictService extends BaseService {
  @InjectEntityModel(Dict)
  dictModel: Repository<Dict>;

  async page(options: Partial<DictPageDTO>) {
    const { id, name, code } = options;

    const where = {
      id,
      code,
      name: name ? Like(name + '%') : undefined,
    };

    const [list, count] = await this.dictModel.findAndCount({
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

  async list(options: Partial<DictDTO>) {
    const { code } = options || {};
    const list = await this.dictModel.find({
      where: { code },
    });
    return { list };
  }

  async info(id: number) {
    const info = await this.dictModel.findOne({ where: { id } });
    return info;
  }

  async create(inDto: DictCreateDTO) {
    const { id } = await this.dictModel.save(inDto);
    return { id };
  }

  async update(upDto: DictUpdateDTO) {
    return await this.dictModel.update(upDto.id, upDto);
  }

  async delete(id: number) {
    return await this.dictModel.delete(id);
  }
}
