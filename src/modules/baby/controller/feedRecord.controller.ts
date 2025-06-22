import {
  Body,
  Controller,
  Del,
  Get,
  Inject,
  Post,
  Put,
  Query,
} from '@midwayjs/core';
import { ApiOperation } from '@midwayjs/swagger';
import { Validate } from '@midwayjs/validate';
import { BaseController } from '../../base/base.controller';
import {
  FeedRecordCreateDTO,
  FeedRecordDTO,
  FeedRecordPageDTO,
  FeedRecordUpdateDTO,
  LatestFeedRecordDto,
} from '../dto/feedRecord.dto';
import { FeedRecordService } from '../service/feedRecord.service';

@Controller('/baby/feedRecord', {
  description: '喂养记录',
  tagName: 'feedRecord',
})
export class FeedRecordController extends BaseController {
  @Inject()
  feedRecordService: FeedRecordService;

  @Post('/page')
  @ApiOperation({ summary: '分页获取列表' })
  async page(@Body() feedDto: FeedRecordPageDTO) {
    const res = await this.feedRecordService.page(feedDto);
    return this.success(res);
  }

  @Post('/list')
  @ApiOperation({ summary: '获取列表' })
  async list(@Body() feedDto: FeedRecordUpdateDTO) {
    const res = await this.feedRecordService.list(feedDto);
    return this.success(res);
  }

  @Post('/days')
  @ApiOperation({ summary: '获取当前用户喂养数据的天数' })
  async days(@Body() feedDto: FeedRecordDTO) {
    const res = await this.feedRecordService.days(feedDto);
    return this.success(res);
  }

  /**
   * 获取指定 babyId 的最新喂养记录
   */
  @Post('/latestFeedRecords')
  @Validate()
  @ApiOperation({ summary: '获取指定 babyId 的最新喂养记录' })
  async latestFeedRecords(@Body() dto: LatestFeedRecordDto) {
    const res = await this.feedRecordService.latestFeedRecords(dto);
    return this.success(res);
  }

  @Get('/info')
  @ApiOperation({ summary: '查询详情' })
  async info(@Query('id') id: number) {
    const uid = id || this.ctx.uid;
    const res = await this.feedRecordService.info(uid);
    return this.success(res);
  }

  @Post('/create')
  @Validate()
  @ApiOperation({ summary: '添加' })
  async create(@Body() dto: FeedRecordCreateDTO) {
    dto.createId = this.ctx.uid;
    const res = await this.feedRecordService.create(dto);
    return this.success(res);
  }

  @Put('/update')
  @Validate()
  @ApiOperation({ summary: '更新' })
  async update(@Body() dto: FeedRecordUpdateDTO) {
    const res = await this.feedRecordService.update(dto);
    return this.success(res);
  }

  @Del('/delete')
  @Validate()
  @ApiOperation({ summary: '删除' })
  async delete(@Query('id') id: string) {
    const res = await this.feedRecordService.delete(id);
    return this.success(res);
  }
}
