import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Like, Repository } from 'typeorm';
import { BaseService } from '../../base/base.service';
import {
  FeedRecordCreateDTO,
  FeedRecordPageDTO,
  FeedRecordUpdateDTO,
} from '../dto/feedRecord.dto';
import { FeedRecord } from '../entity/feedRecord';

@Provide()
export class FeedRecordService extends BaseService {
  @InjectEntityModel(FeedRecord)
  feedRecordModel: Repository<FeedRecord>;

  async page(options: Partial<FeedRecordPageDTO>) {
    const { id, type, content, feedTime } = options;

    const where = {
      id,
      type,
      feedTime,
      content: content ? Like(content + '%') : undefined,
    };

    const [list, count] = await this.feedRecordModel.findAndCount({
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
    const info = await this.feedRecordModel.findOne({ where: { id } });
    return info;
  }

  async create(inDto: FeedRecordCreateDTO) {
    const { id } = await this.feedRecordModel.save(inDto);
    return { id };
  }

  async update(upDto: FeedRecordUpdateDTO) {
    return await this.feedRecordModel.update(upDto.id, upDto);
  }

  async delete(id: number) {
    return await this.feedRecordModel.delete(id);
  }
}
