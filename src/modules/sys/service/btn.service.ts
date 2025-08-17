import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Like, Repository } from 'typeorm';
import { BaseService } from '../../base/base.service';
import { BtnCreateDTO, BtnDTO, BtnPageDTO, BtnUpdateDTO } from '../dto/btn.dto';
import { Btn } from '../entity/btn';

@Provide()
export class BtnService extends BaseService {
  @InjectEntityModel(Btn)
  btnModel: Repository<Btn>;

  async page(options: Partial<BtnPageDTO>) {
    const { id, name, code } = options;

    const where = {
      id,
      code,
      name: name ? Like(name + '%') : undefined,
    };

    const [list, count] = await this.btnModel.findAndCount({
      select: [
        'id',
        'name',
        'code',
        'icon',
        'orderNum',
        'remark',
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

  async list(options: Partial<BtnDTO>) {
    const { code } = options || {};
    const list = await this.btnModel.find({
      where: { code },
      order: {
        orderNum: 'ASC',
      },
    });
    return { list };
  }

  async info(id: number) {
    const info = await this.btnModel.findOne({ where: { id } });
    return info;
  }

  async create(inDto: BtnCreateDTO) {
    const { id } = await this.btnModel.save(inDto);
    return { id };
  }

  async update(upDto: BtnUpdateDTO) {
    return await this.btnModel.update(upDto.id, upDto);
  }

  async delete(id: number) {
    return await this.btnModel.delete(id);
  }
}
