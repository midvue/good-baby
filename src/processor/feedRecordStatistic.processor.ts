import { Processor, IProcessor } from '@midwayjs/bullmq';
import { FeedRecordStatisticsService } from '../modules/baby/service/feedRecordStatistics.service';
import { SubscribeMessageService } from '../modules/account/service/subscribeMessage.service';
import { FORMAT, Inject } from '@midwayjs/core';
import { useDate } from '@mid-vue/shared';

@Processor('feedRecordStatistics', {
  repeat: {
    pattern: FORMAT.CRONTAB.EVERY_DAY_ZERO_FIFTEEN,
  },
})
export class FeedRecordStatisticsProcessor implements IProcessor {
  @Inject()
  feedRecordStatisticsService: FeedRecordStatisticsService;

  @Inject()
  subscribeMessageService: SubscribeMessageService;

  async execute() {
    //获取昨天的日期
    const currDate = useDate().subtract(1, 'day');
    const option = {
      startFeedTime: currDate.format('YYYY-MM-DD 00:00:00'),
      endFeedTime: currDate.format('YYYY-MM-DD 23:59:59'),
    };
    // 获取有喂养记录宝宝id
    const babyIds = await this.feedRecordStatisticsService.getBabyIdList(
      option
    );
    // 统计每个宝宝的喂养记录
    for (const babyId of babyIds) {
      await this.feedRecordStatisticsService.statistics({
        ...option,
        babyId,
      });
    }

    // 周一分支：下发上周周报订阅消息（复用本任务的聚合数据时机）
    // useDate().day() === 1 表示周一（0=周日, 1=周一, ..., 6=周六）
    if (useDate().day() === 1) {
      await this.subscribeMessageService.sendWeeklyReports();
    }
  }
}
