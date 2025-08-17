import { Body, Controller, Get, Inject, Post } from '@midwayjs/core';
import { ApiOperation, ApiTags } from '@midwayjs/swagger';
import { BaseController } from '../../base/base.controller';
import { PointsSummaryService } from '../service/pointsSummary.service';
import {
  PointsSummaryDTO,
  PointsSummaryPageDTO,
} from '../dto/pointsSummary.dto';

@ApiTags('积分汇总模块')
@Controller('/points/summary', { description: '积分汇总相关接口' })
export class PointsSummaryController extends BaseController {
  @Inject()
  pointsSummaryService: PointsSummaryService;

  @Post('/page')
  @ApiOperation({ summary: '积分汇总分页查询' })
  async page(@Body() dto: PointsSummaryPageDTO) {
    const res = await this.pointsSummaryService.page(dto);
    return this.success(res);
  }

  @Post('/info')
  @ApiOperation({ summary: '积分汇总详情查询' })
  async info(@Body() dto: PointsSummaryDTO) {
    dto.userId = dto.userId || this.ctx.uid;
    const res = await this.pointsSummaryService.info(dto);
    return this.success(res);
  }
}
