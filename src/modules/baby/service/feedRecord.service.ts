import { isEmptyValue, minute, useDate } from '@mid-vue/shared';
import { Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Between, Repository } from 'typeorm';
import { BaseService } from '../../base/base.service';
import { BabyService } from './baby.service';
import {
  FeedRecordCreateDTO,
  FeedRecordDaysDTO,
  FeedRecordPageByDayDTO,
  FeedRecordPageDTO,
  FeedRecordUpdateDTO,
  LatestFeedRecordDto,
} from '../dto/feedRecord.dto';
import { FeedRecord } from '../entity/feedRecord';
import { PointsRecordService } from '../../points/service/pointsRecord.service';
import { EnumRuleCode } from '../../points/constants';

@Provide()
export class FeedRecordService extends BaseService {
  @InjectEntityModel(FeedRecord)
  feedRecordModel: Repository<FeedRecord>;

  @Inject()
  babyService: BabyService;

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
    // 提取所有 babyIds（去重，避免重复查询）
    const babyIds = [...new Set(list.map(item => item.babyId).filter(Boolean))];
    if (babyIds.length > 0) {
      // 批量查询用户昵称（假设用户服务有此方法，返回 { userId: nickname } 映射）
      const userNicknames = await this.babyService.getNicknamesByIds(babyIds);

      // 为每条记录添加 nickname 字段
      list.forEach(item => {
        item.nickname = userNicknames[item.babyId] || ''; // 无昵称时显示空字符串
      });
    }
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

  /**
   * 按天分页查询喂养记录
   * - 分页单位为"天",某一天的全部记录必定在同一页返回,不会被切断
   * - count 语义为"总有记录的天数",非总记录数
   * - 不做后端聚合,前端 formatSummary 遇到的都是完整的天,自然工作
   * @param options 查询参数 (babyId 必填, feedType 可选)
   */
  async pageByDay(options: FeedRecordPageByDayDTO) {
    const { babyId, feedType, current, size } = options;

    // ① 查有记录的日期 (按天分页)
    // 用 DATE_FORMAT 直接返回 'YYYY-MM-DD' 字符串,避免 Date 对象跨时区转换偏移
    const dayQb = this.feedRecordModel
      .createQueryBuilder('r')
      .select("DISTINCT DATE_FORMAT(r.feedTime, '%Y-%m-%d')", 'feedDate')
      .where('r.babyId = :babyId', { babyId });

    if (!isEmptyValue(feedType)) {
      dayQb.andWhere('r.feedType = :feedType', { feedType });
    }

    const dayRows = await dayQb
      .orderBy('feedDate', 'DESC')
      .skip((current - 1) * size)
      .take(size)
      .getRawMany();

    // 无数据直接返回
    if (dayRows.length === 0) {
      return { list: [], count: 0 };
    }

    // ② 查这些天内的全部明细
    // 用 BETWEEN 利用 (babyId, feedTime) 索引做范围扫描,
    // 比 DATE_FORMAT(feedTime) IN (...) 快得多 (无需对每行计算函数)
    // feedDate 已是 'YYYY-MM-DD' 字符串,拼接 00:00:00/23:59:59 后是合法的时间字面量
    const dates = dayRows.map(r => r.feedDate);
    const minDate = dates[dates.length - 1];
    const maxDate = dates[0];

    const listQb = this.feedRecordModel
      .createQueryBuilder('r')
      .where('r.babyId = :babyId', { babyId })
      .andWhere('r.feedTime BETWEEN :start AND :end', {
        start: `${minDate} 00:00:00`,
        end: `${maxDate} 23:59:59`,
      });

    if (!isEmptyValue(feedType)) {
      listQb.andWhere('r.feedType = :feedType', { feedType });
    }

    const list = await listQb.orderBy('r.feedTime', 'DESC').getMany();

    // ③ 查总天数 (用于前端判断是否还有更多页)
    const countQb = this.feedRecordModel
      .createQueryBuilder('r')
      .select("COUNT(DISTINCT DATE_FORMAT(r.feedTime, '%Y-%m-%d'))", 'cnt')
      .where('r.babyId = :babyId', { babyId });

    if (!isEmptyValue(feedType)) {
      countQb.andWhere('r.feedType = :feedType', { feedType });
    }

    const { cnt } = await countQb.getRawOne();

    return { list, count: Number(cnt) };
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
    // 喂养记录创建后自动产生积分（AUTO类型，由规则配置limitPerDay控制上限）
    // 积分异常不应影响主业务，catch 掉只记日志
    this.pointsRecordService
      .add(inDto.createId, EnumRuleCode.DAILY_FEED, { sourceId: id })
      .catch(err => this.logger.error('积分奖励失败:', err.message));
    return { id };
  }

  async update(upDto: FeedRecordUpdateDTO) {
    return await this.feedRecordModel.update(upDto.id, upDto);
  }

  async delete(id: string) {
    return await this.feedRecordModel.delete(id);
  }
}
