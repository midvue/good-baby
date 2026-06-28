import { Body, Controller, Inject, Post } from '@midwayjs/core';
import { ApiOperation } from '@midwayjs/swagger';
import { Validate } from '@midwayjs/validate';
import { BaseController } from '../../base/base.controller';
import { SubscribeReportDTO, SubscribeTriggerDTO } from '../dto/subscribe.dto';
import { SubscribeService } from '../service/subscribe.service';
import { SubscribeMessageService } from '../service/subscribeMessage.service';

@Controller('/subscribe', {
  description: '订阅消息',
  tagName: 'subscribe',
})
export class SubscribeController extends BaseController {
  @Inject()
  subscribeService: SubscribeService;

  @Inject()
  subscribeMessageService: SubscribeMessageService;

  /**
   * 上报订阅授权结果（前端 requestSubscribeMessage 回调后调用）
   */
  @Post('/report')
  @Validate()
  @ApiOperation({ summary: '上报订阅授权结果' })
  async report(@Body() dto: SubscribeReportDTO) {
    const userId = this.ctx.uid;
    const count = await this.subscribeService.report(userId, dto);
    return this.success(count);
  }

  /**
   * 手动触发下发（联调用，swagger 点一下即触发）
   * 走真实链路：扫描 → 筛可用用户 → 微信 send → 扣减配额
   */
  @Post('/trigger')
  @Validate()
  @ApiOperation({ summary: '手动触发下发（联调用）' })
  async trigger(@Body() dto: SubscribeTriggerDTO) {
    if (dto.babyId) {
      this.ctx.logger.info(
        `[subscribe/trigger] type=${dto.type} babyId=${dto.babyId}`
      );
    }
    const count =
      dto.type === 'feedReminder'
        ? await this.subscribeMessageService.scanFeedReminder()
        : await this.subscribeMessageService.sendWeeklyReports();
    return this.success(count);
  }
}
