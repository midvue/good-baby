import { Body, Controller, Get, Inject, Post } from '@midwayjs/core';
import { ApiOperation, ApiTags } from '@midwayjs/swagger';
import { Validate } from '@midwayjs/validate';
import { BaseController } from '../../base/base.controller';
import { PointsSummaryService } from '../service/pointsSummary.service';
import { PointsSummaryPageDTO } from '../dto/pointsSummary.dto';

@ApiTags('积分汇总模块')
@Controller('/points/summary', { description: '积分汇总相关接口' })
export class PointsSummaryController extends BaseController {
  @Inject()
  pointsSummaryService: PointsSummaryService;

  @Post('/page')
  @ApiOperation({ summary: '积分汇总分页查询' })
  async getPage(@Body() dto: PointsSummaryPageDTO) {
    const res = await this.pointsSummaryService.getPage(dto);
    return this.success(res);
  }
}
