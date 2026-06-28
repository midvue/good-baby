import { Processor, IProcessor } from '@midwayjs/bullmq';
import { Inject } from '@midwayjs/core';
import { FORMAT } from '@midwayjs/core';
import { SubscribeMessageService } from '../modules/account/service/subscribeMessage.service';

/**
 * 喂养提醒定时扫描任务
 * 每 10 分钟执行一次，扫描配置时间窗内有奶瓶喂养且本轮未发过的宝宝，下发喂养提醒
 */
@Processor('feedReminder', {
  repeat: {
    pattern: FORMAT.CRONTAB.EVERY_PER_10_MINUTE,
  },
})
export class FeedReminderProcessor implements IProcessor {
  @Inject()
  subscribeMessageService: SubscribeMessageService;

  async execute() {
    await this.subscribeMessageService.scanFeedReminder();
  }
}
