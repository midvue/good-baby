import { minute } from '@mid-vue/shared';
import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Between, Repository } from 'typeorm';
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
    const { id, feedType, startFeedTime, endFeedTime, babyId } = options;

    const where = {
      id,
      feedTime: startFeedTime
        ? Between(startFeedTime, endFeedTime || minute(Date.now()))
        : undefined,
      babyId,
      feedType,
    };

    const [list, count] = await this.feedRecordModel.findAndCount({
      where,
      order: {
        feedTime: 'DESC',
      },
      skip: (options.current - 1) * options.size,
      take: options.size,
    });

    return { list, count };
  }

  async list(options: Partial<FeedRecordUpdateDTO>) {
    const { id, feedType, startFeedTime, endFeedTime, babyId } = options;

    const where = {
      id,
      feedTime: startFeedTime
        ? Between(startFeedTime, endFeedTime || minute(Date.now()))
        : undefined,
      babyId,
      feedType,
    };

    const list = await this.feedRecordModel.find({
      select: ['babyId', 'feedTime', 'feedType', 'content'],
      where,
    });

    return list;
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
