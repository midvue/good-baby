import { Config, Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { BaseService } from '../../base/base.service';
import { SubscribeService } from './subscribe.service';
import { WxSubscribeService } from './wxSubscribe.service';
import { FeedRecordStatisticsService } from '../../baby/service/feedRecordStatistics.service';
import { BabyService } from '../../baby/service/baby.service';
import { FeedRecord } from '../../baby/entity/feedRecord';
import { AccountBabyFamily } from '../../baby/entity/accountBabyFamily';
import { Baby } from '../../baby/entity/baby';
import { EnumFeedType } from '../../../constants/dict';
import {
  EnumWxSubscribeConfig,
  EnumWxSubscribePage,
  EnumWxSubscribeTemplate,
} from '../constants';
import { EnumRelation } from '../../baby/constans';
import { dateFormat, durationFormatNoZero, useDate } from '@mid-vue/shared';

/**
 * 订阅消息下发服务
 * 含两类下发：喂养提醒（定时扫描）、周报（周一触发）
 */
@Provide()
export class SubscribeMessageService extends BaseService {
  @InjectEntityModel(FeedRecord)
  feedRecordModel: Repository<FeedRecord>;

  @InjectEntityModel(AccountBabyFamily)
  accountBabyFamilyModel: Repository<AccountBabyFamily>;

  @InjectEntityModel(Baby)
  babyModel: Repository<Baby>;

  @Inject()
  subscribeService: SubscribeService;

  @Inject()
  wxSubscribeService: WxSubscribeService;

  @Inject()
  feedRecordStatisticsService: FeedRecordStatisticsService;

  @Inject()
  babyService: BabyService;

  /** 订阅消息配置（时间窗等，由 .env 驱动） */
  @Config('subscribe')
  subscribeConfig: { feedReminderIntervalHour: number };

  // ════════════════════════════════════════════════════════════
  //  ① 喂养提醒：定时任务每 10 分钟扫描
  // ════════════════════════════════════════════════════════════

  /**
   * 扫描并下发喂养提醒
   * 异常容错：单个宝宝/单次下发失败 catch 并记日志，不中断整体扫描
   * 时间窗由 config 驱动：dev interval=0 → [NOW-1h, NOW] 立即触发；生产 interval=3 → [NOW-4h, NOW-3h]
   * @returns 本轮扫描命中的候选宝宝数量
   */
  async scanFeedReminder() {
    const intervalHour = this.subscribeConfig.feedReminderIntervalHour;
    const limit = EnumWxSubscribeConfig.FEED_REMINDER_BATCH_LIMIT;
    const templateId = EnumWxSubscribeTemplate.FEED_REMINDER;

    // 候选宝宝：配置时间窗内有奶瓶喂养的（窗口避免全表）
    const now = useDate();
    const startTime = now
      .subtract(intervalHour + 1, 'hour')
      .format('YYYY-MM-DD HH:mm:ss');
    const endTime = now
      .subtract(intervalHour, 'hour')
      .format('YYYY-MM-DD HH:mm:ss');
    this.logger.info(
      `[feedReminder] 扫描窗口 interval=${intervalHour}h, [${startTime}, ${endTime}]`
    );

    const records = await this.feedRecordModel.find({
      select: ['babyId'],
      where: {
        feedType: EnumFeedType.MILK_BOTTLE,
        feedTime: Between(startTime, endTime),
      },
      take: limit,
    });
    const babyIds = Array.from(new Set(records.map(r => r.babyId)));
    this.logger.info(
      `[feedReminder] 命中记录 ${records.length} 条，去重后宝宝 ${babyIds.length} 个`
    );

    // 逐个宝宝处理（防重复在 processFeedReminder 内基于 lastSendTime < feedTime 判断）
    for (const babyId of babyIds) {
      try {
        await this.processFeedReminder(babyId, templateId);
      } catch (err) {
        this.logger.error(
          `[feedReminder] 处理宝宝失败 babyId=${babyId}:`,
          err.message
        );
      }
    }
    return babyIds.length;
  }

  /**
   * 处理单个宝宝的喂养提醒：取最近一条奶瓶喂养 → 查发送对象 → 下发
   */
  private async processFeedReminder(babyId: string, templateId: string) {
    const latestRecord = await this.feedRecordModel.findOne({
      select: ['id', 'feedTime', 'content', 'createId'],
      where: { babyId, feedType: EnumFeedType.MILK_BOTTLE },
      order: { feedTime: 'DESC' },
    });
    if (!latestRecord) return;

    const baby = await this.babyModel.findOne({
      select: ['familyId'],
      where: { id: babyId },
    });
    if (!baby) return;

    // 发送对象：父母 + 上次喂养人，去重
    const parents = await this.accountBabyFamilyModel.find({
      select: ['userId'],
      where: {
        familyId: baby.familyId,
        relation: In([EnumRelation.FATHER, EnumRelation.MOTHER]),
      },
    });
    const targetUserIds = Array.from(
      new Set(
        [...parents.map(p => p.userId), latestRecord.createId].filter(Boolean)
      )
    );
    if (targetUserIds.length === 0) return;

    const subscribers = await this.subscribeService.getAvailableRecords(
      targetUserIds,
      templateId
    );
    if (subscribers.length === 0) return;

    // 防重复：lastSendTime >= feedTime 表示这次喂养已发过提醒
    const feedTimeMs = new Date(latestRecord.feedTime).getTime();
    const targets = subscribers.filter(s => {
      const lastSend = s.lastSendTime ? new Date(s.lastSendTime).getTime() : 0;
      return lastSend < feedTimeMs;
    });
    if (targets.length === 0) return;

    const templateData = this.buildFeedReminderData(latestRecord);
    await this.sendToSubscribers(
      targets,
      templateId,
      templateData,
      'feedReminder',
      EnumWxSubscribePage.FEED_REMINDER
    );
  }

  /**
   * 构造喂养提醒模板数据
   * time1=上次喂养时间 / thing2=距离上次 / character_string3=上次容量 / phrase4=上次类型 / thing5=温馨提示
   */
  private buildFeedReminderData(
    record: FeedRecord
  ): Record<string, { value: string }> {
    const feedTime = dateFormat(record.feedTime, 'YYYY-MM-DD HH:mm');
    const duration = useDate().diff(useDate(record.feedTime));
    const durationText =
      (durationFormatNoZero(duration, {
        format: 'H小时m分钟',
      }) as string) || '刚刚';
    const content = (record.content || {}) as {
      volume?: number;
      type?: number;
    };
    const typeText =
      content.type === EnumFeedType.MILK_BOTTLE
        ? '奶粉'
        : content.type === EnumFeedType.BREAST_FEED_DIRECT
        ? '母乳'
        : '奶瓶';

    return {
      time1: { value: feedTime },
      thing2: { value: durationText },
      character_string3: { value: content.volume ? `${content.volume}ml` : '' },
      phrase4: { value: typeText },
      thing5: { value: '宝宝可能饿了，记得喂养' },
    };
  }

  // ════════════════════════════════════════════════════════════
  //  ② 周报：周一 00:15 触发
  // ════════════════════════════════════════════════════════════

  /**
   * 下发上周周报给所有符合条件的订阅者
   * 异常容错：单个宝宝/单次下发失败 catch 并记日志，不中断整体流程
   * @returns 本轮处理的宝宝数量
   */
  async sendWeeklyReports() {
    const templateId = EnumWxSubscribeTemplate.WEEKLY_REPORT;

    // 计算上周一 00:00:00 ~ 上周日 23:59:59
    const lastWeekStart = useDate()
      .subtract(1, 'week')
      .startOf('week')
      .add(1, 'day');
    const lastWeekEnd = lastWeekStart.clone().endOf('week');
    const option = {
      startFeedTime: lastWeekStart.format('YYYY-MM-DD HH:mm:ss'),
      endFeedTime: lastWeekEnd.format('YYYY-MM-DD HH:mm:ss'),
    };

    // 查上周有喂养记录的宝宝（复用 getBabyIdList）
    const babyIds = await this.feedRecordStatisticsService.getBabyIdList(
      option
    );
    if (babyIds.length === 0) return 0;

    // 逐个宝宝聚合周报数据并下发
    for (const babyId of babyIds) {
      try {
        await this.processWeeklyReport(babyId, templateId, option);
      } catch (err) {
        this.logger.error(
          `[weeklyReport] 处理宝宝失败 babyId=${babyId}:`,
          err.message
        );
      }
    }
    return babyIds.length;
  }

  /**
   * 处理单个宝宝的周报下发
   */
  private async processWeeklyReport(
    babyId: string,
    templateId: string,
    option: { startFeedTime: string; endFeedTime: string }
  ) {
    const weeklyData = await this.feedRecordStatisticsService.week({
      babyId,
      ...option,
    });

    const userIds = Object.keys(weeklyData.userStat || {});
    if (userIds.length === 0) return;

    const subscribers = await this.subscribeService.getAvailableRecords(
      userIds,
      templateId
    );
    if (subscribers.length === 0) return;

    const baby = await this.babyService.info(babyId);
    const templateData = this.buildWeeklyReportData(
      weeklyData,
      baby?.nickname || '宝宝',
      option
    );

    await this.sendToSubscribers(
      subscribers,
      templateId,
      templateData,
      'weeklyReport',
      EnumWxSubscribePage.WEEKLY_REPORT
    );
  }

  /**
   * 构造周报模板数据
   * time1=周报日期 / thing4=时间（总次数）/ thing7=备注 / thing8=用户名称
   */
  private buildWeeklyReportData(
    weeklyData: {
      count?: number;
      detailMap?: Record<string, { total?: number }>;
    },
    babyNickname: string,
    option: { startFeedTime: string; endFeedTime: string }
  ): Record<string, { value: string }> {
    const dateRange = `${dateFormat(
      option.startFeedTime,
      'MM月DD日'
    )}-${dateFormat(option.endFeedTime, 'MM月DD日')}`;
    const milkBottle = weeklyData.detailMap?.[EnumFeedType.MILK_BOTTLE];

    return {
      time1: { value: dateRange },
      thing4: { value: `本周共喂养 ${weeklyData.count || 0} 次` },
      thing7: {
        value: milkBottle?.total
          ? `奶瓶总喂养 ${milkBottle.total} ml`
          : '继续保持哦',
      },
      thing8: { value: babyNickname },
    };
  }

  // ════════════════════════════════════════════════════════════
  //  公共：批量下发
  // ════════════════════════════════════════════════════════════

  /**
   * 逐个下发并扣减配额
   * @param subscribers 订阅者列表（已过滤 available_count > 0）
   * @param templateId 模板 id
   * @param templateData 模板字段
   * @param logTag 日志前缀
   * @param page 点击跳转的小程序页面路径
   */
  private async sendToSubscribers(
    subscribers: Array<{ userId: string; openid: string; lastSendTime?: Date }>,
    templateId: string,
    templateData: Record<string, { value: string }>,
    logTag: string,
    page?: string
  ) {
    for (const target of subscribers) {
      try {
        const result = await this.wxSubscribeService.send(
          target.openid,
          templateId,
          templateData,
          page
        );
        if (result.success) {
          await this.subscribeService.consumeQuota(target.userId, templateId);
        } else {
          this.logger.warn(
            `[${logTag}] 下发失败 openid=${target.openid} errcode=${result.errcode} errmsg=${result.errmsg}`
          );
        }
      } catch (err) {
        this.logger.error(
          `[${logTag}] 下发异常 openid=${target.openid}:`,
          err.message
        );
      }
    }
  }
}
