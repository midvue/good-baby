import { dateFormat, minute, useDate } from '@mid-vue/shared';
import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Between, Repository } from 'typeorm';
import { BaseService } from '../../base/base.service';
import { FeedRecordPageDTO, FeedRecordUpdateDTO } from '../dto/feedRecord.dto';
import { FeedRecord } from '../entity/feedRecord';
import {
  FeedRecordStatistics,
  FeedStatBase,
} from '../entity/feedRecordStatistics';
import { EnumFeedType } from '../../../constants/dict';

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
   * @param option 查询参数
   */
  async list(option: Partial<FeedRecordUpdateDTO>) {
    const { babyId, startFeedTime, endFeedTime } = option;
    const where = {
      babyId,
      feedDate: undefined,
    };
    if (startFeedTime && endFeedTime) {
      where.feedDate = Between(startFeedTime, endFeedTime);
    }
    const list = await this.feedRecordStatisticsModel.find({
      where,
      order: {
        feedDate: 'DESC',
      },
    });
    return list;
  }

  /** 获取周统计
   * @param option 查询参数
   */
  async week(option: Partial<FeedRecordUpdateDTO>) {
    const { babyId, startFeedTime, endFeedTime } = option;

    // 使用mysql week函数
    const list = await this.feedRecordStatisticsModel.find({
      order: {
        feedDate: 'DESC',
      },
      where: {
        babyId,
        feedDate: Between(startFeedTime, endFeedTime),
      },
    });
    //把每日的数据合并成周数据
    const week = list.reduce(
      (acc, cur) => {
        acc.count += cur.count;
        Object.values(cur).forEach(item => {
          const { feedType, count, total } = item;
          if (!acc.detailMap[feedType]) {
            acc.detailMap[feedType] = {
              feedType,
              count: count,
              total: total,
            };
          } else {
            acc.detailMap[feedType].count += count;
            acc.detailMap[feedType].total += total;
          }
        });
        return acc;
      },
      {
        detailMap: {} as Record<
          string,
          { feedType: string; count: number; total?: number }
        >,
        count: 0,
        babyId,
      }
    );

    return week;
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

    //获取指定时间范围内的宝宝喂养记录
    const list = await this.feedRecordModel.find({
      select: ['createId', 'feedType', 'content', 'feedTime'],
      where: {
        babyId,
        feedTime: Between(startFeedTime, endFeedTime),
      },
    });

    // 定义统计映射类型
    interface FeedRecordStat {
      count: number;
      lastFeedTime: string;
      lastFeedUid: string;
      total?: number;
      duration?: number;
      // 按用户维度的详细统计
      userStats: Record<string, FeedStatBase>;
      // 用于尿布类型的额外信息，key为 poopType_poopColor 格式
      diaperInfo?: Record<string, { count: number }>;
    }

    type FeedRecordStatisticsMap = Record<
      string,
      Record<string, FeedRecordStat>
    >;

    // 按日期和喂养类型聚合数据
    const groupeMap = list.reduce((acc, cur) => {
      const date = dateFormat(cur.feedTime, 'YYYY-MM-DD');
      const feedTime = useDate(cur.feedTime).format('YYYY-MM-DD HH:mm:ss');

      // 初始化日期
      if (!acc[date]) {
        acc[date] = {} as FeedRecordStatisticsMap[''];
      }

      // 初始化该日期该喂养类型的记录
      if (!acc[date][cur.feedType]) {
        acc[date][cur.feedType] = {
          count: 0,
          total: 0,
          duration: 0,
          lastFeedTime: feedTime,
          lastFeedUid: cur.createId,
          userStats: {} as Record<string, FeedStatBase>,
          diaperInfo: undefined,
        };
      }

      // 初始化该用户的统计信息
      if (!acc[date][cur.feedType].userStats[cur.createId]) {
        acc[date][cur.feedType].userStats[cur.createId] = {
          count: 0,
          lastFeedTime: feedTime,
          lastFeedUid: cur.createId,
          feedType: cur.feedType as EnumFeedType,
        };
      }

      // 更新总计数
      acc[date][cur.feedType].count += 1;

      // 更新用户维度的计数
      acc[date][cur.feedType].userStats[cur.createId].count += 1;

      // 只保留当天 06:00 之前的最晚时间
      const curFeedTime = useDate(feedTime);
      const sixAm = curFeedTime.startOf('day').add(6, 'hour');

      // 更新最晚喂养时间和用户ID（只计算凌晨6点前的最晚时间）
      if (
        curFeedTime.isBefore(sixAm) &&
        useDate(feedTime).isAfter(useDate(acc[date][cur.feedType].lastFeedTime))
      ) {
        acc[date][cur.feedType].lastFeedTime = feedTime;
        acc[date][cur.feedType].lastFeedUid = cur.createId;
      }

      // 更新用户维度的最晚喂养时间（只计算凌晨6点前的最晚时间）
      if (
        curFeedTime.isBefore(sixAm) &&
        useDate(feedTime).isAfter(
          useDate(acc[date][cur.feedType].userStats[cur.createId].lastFeedTime)
        )
      ) {
        acc[date][cur.feedType].userStats[cur.createId].lastFeedTime = feedTime;
        acc[date][cur.feedType].userStats[cur.createId].lastFeedUid =
          cur.createId;
      }

      // 根据不同喂养类型处理特定数据
      switch (cur.feedType) {
        case EnumFeedType.MILK_BOTTLE:
          // 确保total有初始值0
          if (!acc[date][cur.feedType].total) {
            acc[date][cur.feedType].total = 0;
          }
          if (!acc[date][cur.feedType].userStats[cur.createId].total) {
            acc[date][cur.feedType].userStats[cur.createId].total = 0;
          }
          acc[date][cur.feedType].total += +cur.content?.volume || 0;
          acc[date][cur.feedType].userStats[cur.createId].total +=
            +cur.content?.volume || 0;
          break;
        case EnumFeedType.BREAST_FEED_DIRECT:
          // 确保duration有初始值0
          if (!acc[date][cur.feedType].duration) {
            acc[date][cur.feedType].duration = 0;
          }
          if (
            acc[date][cur.feedType].userStats[cur.createId].duration ===
            undefined
          ) {
            acc[date][cur.feedType].userStats[cur.createId].duration = 0;
          }
          acc[date][cur.feedType].duration += +cur.content?.duration || 0;
          acc[date][cur.feedType].userStats[cur.createId].duration +=
            +cur.content?.duration || 0;
          break;
        case EnumFeedType.DIAPER:
          // 处理尿布记录，统计尿布类型，key为 poopType_poopColor 格式
          if (cur.content?.poopType || cur.content?.poopColor) {
            const key = `${cur.content?.poopType || ''}_${
              cur.content?.poopColor || ''
            }`;
            // 总体统计
            if (!acc[date][cur.feedType].diaperInfo) {
              acc[date][cur.feedType].diaperInfo = {} as Record<
                string,
                { count: number }
              >;
            }
            if (!acc[date][cur.feedType].diaperInfo[key]) {
              acc[date][cur.feedType].diaperInfo[key] = {
                count: 0,
              };
            }
            acc[date][cur.feedType].diaperInfo[key].count += 1;
          }
          break;
        case EnumFeedType.HEIGHT_WEIGHT:
          // 身高体重记录处理
          // 可以根据需要添加特定的处理逻辑
          break;
        default:
          // 处理其他喂养类型，只统计count，不汇总total
          break;
      }

      return acc;
    }, {} as Record<string, Record<string, FeedRecordStat>>);

    // 转换为 FeedRecordStatistics 实体数组
    const groupedList: FeedRecordStatistics[] = Object.entries(groupeMap).map(
      ([feedDate, typeMap]) => {
        let totalCount = 0;

        // 初始化各喂养类型聚合字段，按照实体定义的结构
        let milkBottle: FeedRecordStatistics['milkBottle'] = {
          total: 0,
          count: 0,
          lastFeedTime: '',
          lastFeedUid: '',
          feedType: EnumFeedType.MILK_BOTTLE,
        };
        let breastFeedDirect: FeedRecordStatistics['breastFeedDirect'] = {
          duration: 0,
          count: 0,
          lastFeedTime: '',
          lastFeedUid: '',
          feedType: EnumFeedType.BREAST_FEED_DIRECT,
        };
        let diaper: FeedRecordStatistics['diaper'] = {
          count: 0,
          lastFeedTime: '',
          lastFeedUid: '',
          feedType: EnumFeedType.DIAPER,
        };
        let heightWeight: FeedRecordStatistics['heightWeight'] = {
          count: 0,
          lastFeedTime: '',
          lastFeedUid: '',
          feedType: EnumFeedType.HEIGHT_WEIGHT,
        };
        // 初始化其他喂养类型列表
        const otherFeedList: FeedRecordStatistics['otherFeedList'] = [];

        // 遍历每种喂养类型的数据
        Object.entries(typeMap).forEach(([feedType, stat]) => {
          const feedTypeNum = +feedType;
          totalCount += stat.count || 0;

          // 根据喂养类型设置相应的聚合字段
          switch (feedTypeNum) {
            case EnumFeedType.MILK_BOTTLE:
              milkBottle = {
                total: stat.total || 0,
                count: stat.count || 0,
                lastFeedTime: stat.lastFeedTime,
                lastFeedUid: stat.lastFeedUid || '',
                feedType: EnumFeedType.MILK_BOTTLE,
                // 添加用户维度的详细统计
                ...stat.userStats,
              };
              break;
            case EnumFeedType.BREAST_FEED_DIRECT:
              breastFeedDirect = {
                duration: stat.duration || 0,
                count: stat.count || 0,
                lastFeedTime: stat.lastFeedTime,
                lastFeedUid: stat.lastFeedUid || '',
                feedType: EnumFeedType.BREAST_FEED_DIRECT,
                // 添加用户维度的详细统计
                ...stat.userStats,
              };
              break;
            case EnumFeedType.DIAPER:
              // 基础尿布信息
              diaper = {
                count: stat.count || 0,
                lastFeedTime: stat.lastFeedTime,
                lastFeedUid: stat.lastFeedUid || '',
                feedType: EnumFeedType.DIAPER,
                // 添加用户维度的详细统计
                ...stat.userStats,
              };
              // 如果有尿布类型信息，添加到diaper对象中
              if (stat.diaperInfo) {
                Object.assign(diaper, stat.diaperInfo);
              }
              break;
            case EnumFeedType.HEIGHT_WEIGHT:
              // 身高体重信息
              heightWeight = {
                count: stat.count || 0,
                lastFeedTime: stat.lastFeedTime,
                lastFeedUid: stat.lastFeedUid || '',
                feedType: EnumFeedType.HEIGHT_WEIGHT,
                // 添加用户维度的详细统计
                ...stat.userStats,
              };
              break;
            default:
              {
                // 处理其他喂养类型，添加到otherFeedList中
                const otherFeedItem: FeedStatBase = {
                  count: stat.count || 0,
                  lastFeedTime: stat.lastFeedTime,
                  lastFeedUid: stat.lastFeedUid || '',
                  feedType: feedTypeNum as EnumFeedType,
                  // 添加用户维度的详细统计
                  ...stat.userStats,
                };
                otherFeedList.push(otherFeedItem);
              }
              break;
          }
        });

        return Object.assign(new FeedRecordStatistics(), {
          babyId,
          feedDate,
          count: totalCount,
          milkBottle,
          breastFeedDirect,
          diaper,
          heightWeight,
          otherFeedList,
        });
      }
    );
    await this.feedRecordStatisticsModel.save(groupedList);
    return groupedList;
  }

  async info(id: string) {
    const info = await this.feedRecordModel.findOne({ where: { id } });
    return info;
  }
}
