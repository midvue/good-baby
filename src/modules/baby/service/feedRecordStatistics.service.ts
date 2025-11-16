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

  /**
   * 判断是否为有效的最新喂养时间（只计算凌晨6点前的最晚时间）
   * @param newTime 新的时间
   * @param currentTime 当前记录的时间
   * @returns 是否为更晚的有效时间
   */
  private isLatestFeedTime(newTime: string, currentTime: string) {
    const newFeedTime = useDate(newTime);
    const sixAm = newFeedTime.startOf('day').add(6, 'hour');
    if (newFeedTime.isAfter(sixAm)) return false;
    if (!currentTime) return true;
    // 只有当新时间在凌晨6点之前，并且比当前记录的时间更晚时才更新
    return newFeedTime.isAfter(useDate(currentTime));
  }

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

  /**
   * 更新全局最新的喂养时间
   * @param acc 累加器
   * @param options 包含时间、类型和用户ID的对象
   */
  private updateGlobalLastFeedTime(
    acc: Record<string, any>,
    options: {
      lastFeedTime?: string;
      feedType?: EnumFeedType;
      lastFeedUid?: string;
    }
  ) {
    const { lastFeedTime: time, feedType: type, lastFeedUid: uid } = options;
    // 如果没有时间，则直接返回
    if (!time) return;

    const newFeedTime = useDate(time);
    const sixAm = newFeedTime.startOf('day').add(6, 'hour');
    if (newFeedTime.isAfter(sixAm)) return;
    if (!acc.lastFeedTime || newFeedTime.isAfter(useDate(acc.lastFeedTime))) {
      acc.lastFeedTime = time;
      acc.lastFeedUid = uid || '';
      acc.lastFeedType = type || EnumFeedType.MILK_BOTTLE;
    }
  }

  /** 获取周统计
   * @param option 查询参数
   */
  async week(option: Partial<FeedRecordUpdateDTO>) {
    const { babyId, startFeedTime, endFeedTime } = option;

    // 获取指定时间范围内的每日统计数据
    const list = await this.feedRecordStatisticsModel.find({
      order: {
        feedDate: 'DESC',
      },
      where: {
        babyId,
        feedDate: Between(startFeedTime, endFeedTime),
      },
    });

    // 按周汇总数据
    const weeklyData = list.reduce(
      (acc, cur) => {
        // 累加总次数
        acc.count += cur.count;

        // 处理奶瓶喂养数据
        if (cur.milkBottle) {
          const {
            feedType = EnumFeedType.MILK_BOTTLE,
            count = 0,
            total = 0,
            lastFeedTime,
            lastFeedUid,
          } = cur.milkBottle;
          if (!acc.detailMap[feedType]) {
            acc.detailMap[feedType] = {
              feedType,
              count,
              total,
              dailyMaxTotal: total,
              maxTotalDate: cur.feedDate,

              dailyMaxCount: count,
              maxCountDate: cur.feedDate,
              days: 1,
            };
          } else {
            acc.detailMap[feedType].days += 1;
            acc.detailMap[feedType].count += count;
            acc.detailMap[feedType].total += total;
            // 更新最大总喂养量和日期
            if (total > acc.detailMap[feedType].dailyMaxTotal) {
              acc.detailMap[feedType].dailyMaxTotal = total;
              acc.detailMap[feedType].maxTotalDate = cur.feedDate;
            }
            // 更新最大次数和日期
            if (count > acc.detailMap[feedType].dailyMaxCount) {
              acc.detailMap[feedType].dailyMaxCount = count;
              acc.detailMap[feedType].maxCountDate = cur.feedDate;
            }
          }

          // 更新全局最新的喂养时间
          this.updateGlobalLastFeedTime(acc, {
            lastFeedTime,
            feedType,
            lastFeedUid,
          });
        }

        // 处理母乳亲喂数据
        if (cur.breastFeedDirect) {
          const {
            feedType = EnumFeedType.BREAST_FEED_DIRECT,
            count = 0,
            total = 0,
            duration = 0,
            lastFeedTime,
            lastFeedUid,
          } = cur.breastFeedDirect;
          if (!acc.detailMap[feedType]) {
            acc.detailMap[feedType] = {
              feedType,
              count,
              total,
              duration,
              dailyMaxDuration: duration,
              maxDurationDate: cur.feedDate,
              dailyMaxCount: count,
              maxCountDate: cur.feedDate,
              days: 1,
            };
          } else {
            acc.detailMap[feedType].days += 1;
            acc.detailMap[feedType].count += count;
            acc.detailMap[feedType].total += total;
            acc.detailMap[feedType].duration += duration;
            // 更新最大持续时间和日期
            if (duration > acc.detailMap[feedType].dailyMaxDuration) {
              acc.detailMap[feedType].dailyMaxDuration = duration;
              acc.detailMap[feedType].maxDurationDate = cur.feedDate;
            }

            // 更新最大次数和日期
            if (count > acc.detailMap[feedType].dailyMaxCount) {
              acc.detailMap[feedType].dailyMaxCount = count;
              acc.detailMap[feedType].maxCountDate = cur.feedDate;
            }
          }

          // 更新全局最新的喂养时间
          this.updateGlobalLastFeedTime(acc, {
            lastFeedTime,
            feedType,
            lastFeedUid,
          });
        }

        // 处理尿布数据
        if (cur.diaper) {
          const {
            feedType = EnumFeedType.DIAPER,
            count = 0,
            lastFeedTime,
            lastFeedUid,
          } = cur.diaper;
          if (!acc.detailMap[feedType]) {
            acc.detailMap[feedType] = {
              feedType,
              count,
              days: 1,
              dailyMaxCount: count,
              maxCountDate: cur.feedDate,
            };
          } else {
            acc.detailMap[feedType].days += 1;
            acc.detailMap[feedType].count += count;
            // 更新最大次数和日期
            if (count > acc.detailMap[feedType].dailyMaxCount) {
              acc.detailMap[feedType].dailyMaxCount = count;
              acc.detailMap[feedType].maxCountDate = cur.feedDate;
            }
          }

          // 更新全局最新的喂养时间
          this.updateGlobalLastFeedTime(acc, {
            lastFeedTime,
            feedType,
            lastFeedUid,
          });
        }

        // 处理身高体重数据
        if (cur.heightWeight) {
          const {
            feedType = EnumFeedType.HEIGHT_WEIGHT,
            count = 0,
            lastFeedTime,
            lastFeedUid,
          } = cur.heightWeight;
          if (!acc.detailMap[feedType]) {
            acc.detailMap[feedType] = {
              feedType,
              count,
            };
          } else {
            acc.detailMap[feedType].count += count;
          }

          // 更新全局最新的喂养时间
          this.updateGlobalLastFeedTime(acc, {
            lastFeedTime,
            feedType,
            lastFeedUid,
          });
        }

        // 处理其他喂养类型数据
        if (cur.otherFeedList && Array.isArray(cur.otherFeedList)) {
          cur.otherFeedList.forEach(item => {
            const { feedType, count = 0, lastFeedTime, lastFeedUid } = item;
            if (feedType) {
              if (!acc.detailMap[feedType]) {
                acc.detailMap[feedType] = {
                  feedType,
                  count,
                  days: 1,
                  dailyMaxCount: count,
                  maxCountDate: cur.feedDate,
                };
              } else {
                acc.detailMap[feedType].count += count;
                acc.detailMap[feedType].days += 1;
                // 更新最大次数和日期
                if (count > acc.detailMap[feedType].dailyMaxCount) {
                  acc.detailMap[feedType].dailyMaxCount = count;
                  acc.detailMap[feedType].maxCountDate = cur.feedDate;
                }
              }

              // 更新全局最新的喂养时间
              this.updateGlobalLastFeedTime(acc, {
                lastFeedTime,
                feedType,
                lastFeedUid,
              });
            }
          });
        }

        return acc;
      },
      {
        detailMap: {} as Record<
          string,
          {
            feedType: EnumFeedType;
            /** 总喂养次数 */
            count: number;
            /** 每日最大喂养次数 */
            dailyMaxCount?: number;
            /** 最大喂养次数对应日期 */
            maxCountDate?: string;
            /** 总喂养量 */
            total?: number;
            /** 每日最大总喂养量 */
            dailyMaxTotal?: number;
            /** 最大喂养量对应日期 */
            maxTotalDate?: string;

            /** 母乳总喂养时间 */
            duration?: number;
            /** 每日最大母乳喂养时间 */
            dailyMaxDuration?: number;
            /** 最大母乳喂养时间对应日期 */
            maxDurationDate?: string;
            /** 记录的天数 */
            days?: number;
          }
        >,
        count: 0,
        lastFeedTime: '',
        lastFeedUid: '',
        lastFeedType: EnumFeedType.MILK_BOTTLE, // 默认值
        babyId,
      }
    );

    return weeklyData;
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
