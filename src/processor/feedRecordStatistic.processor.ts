import { Processor, IProcessor } from '@midwayjs/bullmq';
import { FeedRecordStatisticsService } from '../modules/baby/service/feedRecordStatistics.service';
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
  }
}
