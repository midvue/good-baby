import { Processor, IProcessor } from '@midwayjs/bullmq';
import { FeedRecordStatisticsService } from '../modules/baby/service/feedRecordStatistics.service';
import { FORMAT, Inject } from '@midwayjs/core';

@Processor('feedRecordStatistics', {
  repeat: {
    pattern: FORMAT.CRONTAB.EVERY_DAY_ZERO_FIFTEEN,
  },
})
export class FeedRecordStatisticsProcessor implements IProcessor {
  @Inject()
  feedRecordStatisticsService: FeedRecordStatisticsService;
  async execute() {
    // 处理任务逻辑
    const option = {
      startFeedTime: '2024-01-01',
      endFeedTime: '2026-01-01',
    };
    const babyIds = await this.feedRecordStatisticsService.getBabyIdList(
      option
    );
    for (const babyId of babyIds) {
      await this.feedRecordStatisticsService.statistics({
        ...option,
        babyId,
      });
    }
  }
}
