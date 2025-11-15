import { Body, Controller, Get, Inject, Post, Query } from '@midwayjs/core';
import { ApiOperation } from '@midwayjs/swagger';
import { BaseController } from '../../base/base.controller';
import { FeedRecordPageDTO, FeedRecordUpdateDTO } from '../dto/feedRecord.dto';
import { FeedRecordStatisticsService } from '../service/feedRecordStatistics.service';

@Controller('/baby/feedRecordStatistics', {
  description: '喂养记录统计',
  tagName: 'feedRecordStatistics',
})
export class FeedRecordStatisticsController extends BaseController {
  @Inject()
  feedRecordStatisticsService: FeedRecordStatisticsService;

  @Post('/page')
  @ApiOperation({ summary: '分页获取列表' })
  async page(@Body() feedDto: FeedRecordPageDTO) {
    const res = await this.feedRecordStatisticsService.page(feedDto);
    return this.success(res);
  }

  @Post('/list')
  @ApiOperation({ summary: '获取列表' })
  async list(@Body() feedDto: FeedRecordUpdateDTO) {
    const res = await this.feedRecordStatisticsService.list(feedDto);
    return this.success(res);
  }

  @Post('/statistics')
  @ApiOperation({ summary: '统计宝宝每日的数据' })
  async statistics(@Body() feedDto: FeedRecordUpdateDTO) {
    const res = await this.feedRecordStatisticsService.statistics(feedDto);
    return this.success(res);
  }

  @Post('/week')
  @ApiOperation({ summary: '获取周统计' })
  async week(@Body() feedDto: FeedRecordUpdateDTO) {
    const res = await this.feedRecordStatisticsService.week(feedDto);
    return this.success(res);
  }
}
