import { dateFormat, minute } from '@mid-vue/shared';
import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Between, Repository } from 'typeorm';
import { BaseService } from '../../base/base.service';
import { FeedRecordPageDTO, FeedRecordUpdateDTO } from '../dto/feedRecord.dto';
import { FeedRecord } from '../entity/feedRecord';
import { FeedRecordStatistics } from '../entity/feedRecordStatistics';

@Provide()
export class FeedRecordStatisticsService extends BaseService {
  @InjectEntityModel(FeedRecord)
  feedRecordModel: Repository<FeedRecord>;

  @InjectEntityModel(FeedRecordStatistics)
  feedRecordStatisticsModel: Repository<FeedRecordStatistics>;

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
  /**
   * 获取宝宝喂养记录统计列表
   * @param options 查询参数
   */
  async list(options: Partial<FeedRecordUpdateDTO>) {
    const { babyId } = options;

    const list = await this.feedRecordModel
      .createQueryBuilder('record')
      .select([
        'COUNT(*) AS count',
        'record.createId AS createId',
        'record.feedType AS feedType',
        "SUM(JSON_EXTRACT(record.content, '$.volume')) AS total",
        'DATE(record.feedTime) AS feedDate',
      ])
      .where('record.babyId = :babyId', { babyId })
      .groupBy('feedDate, feedType, createId')
      .orderBy('feedDate')
      .getRawMany();

    // 按照 feedDate 合并数据,合并feedDate的数据
    // 规则: total 相加组成信息的total,count 相加组成信息的count,createUsers 合并组成信息的createUsers,feedTypeInfo
    const groupeMap = list.reduce((acc, cur) => {
      const date = dateFormat(cur.feedDate, 'YYYY-MM-DD');
      const count = +cur.count || 0;
      const total = +cur.total || 0;
      if (!acc[date]) {
        acc[date] = Object.assign(new FeedRecordStatistics(), {
          babyId,
          feedDate: date,
          count: count,
          details: [
            {
              createId: cur.createId,
              feedType: cur.feedType,
              count: count,
              total: total,
            },
          ],
        });
      } else {
        acc[date].count += count;
        acc[date].details.push({
          createId: cur.createId,
          feedType: cur.feedType,
          count: count,
          total: total,
        });
      }
      return acc;
    }, {} as Record<string, FeedRecordStatistics>);

    // 转换为数组
    const groupedList = Object.values(groupeMap);
    return groupedList;
  }

  /** 获取指定时间范围
   * 有记录的宝宝id列表 */
  async getBabyIdList(options: Partial<FeedRecordUpdateDTO>) {
    const { startFeedTime, endFeedTime } = options;
    const babyIds = await this.feedRecordModel
      .createQueryBuilder('record')
      .select('record.babyId AS babyId')
      .where('record.feedTime BETWEEN :startFeedTime AND :endFeedTime', {
        startFeedTime,
        endFeedTime,
      })
      .groupBy('babyId')
      .having('count(record.id) > 0')
      .getRawMany();
    return babyIds.map(item => item.babyId);
  }

  /**
   * 获取宝宝喂养记录统计列表
   * @param options 查询参数
   */
  async statistics(options: Partial<FeedRecordUpdateDTO>) {
    const { babyId, startFeedTime, endFeedTime } = options;

    const list = await this.feedRecordModel
      .createQueryBuilder('record')
      .select([
        'COUNT(*) AS count',
        'record.createId AS createId',
        'record.feedType AS feedType',
        "SUM(JSON_EXTRACT(record.content, '$.volume')) AS total",
        'DATE(record.feedTime) AS feedDate',
      ])
      .where('record.babyId = :babyId', { babyId })
      .andWhere('record.feedTime BETWEEN :startFeedTime AND :endFeedTime', {
        startFeedTime,
        endFeedTime,
      })
      .groupBy('feedDate, feedType, createId')
      .orderBy('feedDate')
      .getRawMany();

    // 按照 feedDate 合并数据,合并feedDate的数据
    // 规则: total 相加组成信息的total,count 相加组成信息的count,createUsers 合并组成信息的createUsers,feedTypeInfo
    const groupeMap = list.reduce((acc, cur) => {
      const date = dateFormat(cur.feedDate, 'YYYY-MM-DD');
      const count = +cur.count || 0;
      const total = +cur.total || 0;
      if (!acc[date]) {
        acc[date] = Object.assign(new FeedRecordStatistics(), {
          babyId,
          feedDate: date,
          count: count,
          details: [
            {
              createId: cur.createId,
              feedType: cur.feedType,
              count: count,
              total: total,
            },
          ],
        });
      } else {
        acc[date].count += count;
        acc[date].details.push({
          createId: cur.createId,
          feedType: cur.feedType,
          count: count,
          total: total,
        });
      }
      return acc;
    }, {} as Record<string, FeedRecordStatistics>);

    // 转换为数组
    const groupedList = Object.values(groupeMap);
    console.log(babyId, 22222);

    await this.feedRecordStatisticsModel.save(groupedList);
    return groupedList;
  }

  async info(id: string) {
    const info = await this.feedRecordModel.findOne({ where: { id } });
    return info;
  }
}
