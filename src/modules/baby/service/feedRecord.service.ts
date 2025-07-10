import { minute, useDate } from '@mid-vue/shared';
import { Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Between, Repository } from 'typeorm';
import { BaseService } from '../../base/base.service';
import {
  FeedRecordCreateDTO,
  FeedRecordDaysDTO,
  FeedRecordPageDTO,
  FeedRecordUpdateDTO,
  LatestFeedRecordDto,
} from '../dto/feedRecord.dto';
import { FeedRecord } from '../entity/feedRecord';
import { PointsRecordService } from '../../points/service/pointsRecord.service';

@Provide()
export class FeedRecordService extends BaseService {
  @InjectEntityModel(FeedRecord)
  feedRecordModel: Repository<FeedRecord>;

  @Inject()
  pointsRecordService: PointsRecordService;

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

  async days(options: FeedRecordDaysDTO) {
    let { startFeedTime, endFeedTime, babyId } = options;
    endFeedTime = endFeedTime || minute(Date.now());
    //起始时间与结束时间间隔不能大于42天,
    const startDate = useDate(startFeedTime);
    const endDate = useDate(endFeedTime);
    const durationDays = endDate.diff(startDate, 'day');

    if (durationDays > 42) {
      return this.commError('起始时间与结束时间间隔不能大于42天');
    }
    const list = await this.feedRecordModel.find({
      select: ['feedTime'],
      where: {
        feedTime: Between(startFeedTime, endFeedTime),
        babyId,
      },
    });
    // 对查询的结果去重,汇总次数
    // 使用 reduce 和对象 key 的唯一性进行去重并统计每天的记录数
    const dateCountMap = list.reduce((map, item) => {
      const date = useDate(item.feedTime).format('YYYY-MM-DD');
      map[date] = (map[date] || 0) + 1;
      return map;
    }, {} as Record<string, number>);

    // 遍历起始和结束日期天数差,补充(不连续)缺失的日期,count设为0
    const result = [];
    for (let i = 0; i <= durationDays; i++) {
      const date = startDate.add(i, 'day').format('YYYY-MM-DD');
      result.push({
        date,
        count: dateCountMap[date] || 0,
      });
    }
    return result;
  }

  /**
   * 获取指定 babyId 的最新喂养记录
   * @param babyId 宝宝 ID
   * @param feedTypes 喂养类型数组
   */
  async latestFeedRecords(dto: LatestFeedRecordDto) {
    const { babyId, feedTypes } = dto;
    // 遍历 feedTypes 数组
    // 创建一个数组来存储所有的查询 Promise，去掉 await 让查询并行执行
    const promiseArray = feedTypes.map(feedType => {
      return this.feedRecordModel.findOne({
        select: ['babyId', 'feedTime', 'feedType', 'content'],
        where: {
          babyId,
          feedType,
        },
        order: {
          feedTime: 'DESC',
        },
      });
    });
    const results = await Promise.all(promiseArray);
    return results;
  }

  async info(id: string) {
    const info = await this.feedRecordModel.findOne({ where: { id } });
    return info;
  }

  async create(inDto: FeedRecordCreateDTO) {
    const { id } = await this.feedRecordModel.save(
      Object.assign(new FeedRecord(), inDto)
    );
    // this.pointsRecordService.add(inDto.createId, 'add_daily_feed');
    return { id };
  }

  async update(upDto: FeedRecordUpdateDTO) {
    return await this.feedRecordModel.update(upDto.id, upDto);
  }

  async delete(id: string) {
    return await this.feedRecordModel.delete(id);
  }
}
