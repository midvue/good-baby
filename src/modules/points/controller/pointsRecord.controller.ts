import { Body, Controller, Inject, Post } from '@midwayjs/core';
import { ApiOperation, ApiTags } from '@midwayjs/swagger';
import { BaseController } from '../../base/base.controller';
import { PointsRecordPageDTO } from '../dto/pointsRecord.dto';
import { PointsRecordService } from '../service/pointsRecord.service';

@ApiTags('积分记录模块')
@Controller('/points/record', { description: '积分记录相关接口' })
export class PointsRecordController extends BaseController {
  @Inject()
  pointsRecordService: PointsRecordService;

  @Post('/page')
  @ApiOperation({ summary: '积分记录分页查询' })
  async getPage(@Body() dto: PointsRecordPageDTO) {
    const res = await this.pointsRecordService.getPage(dto);
    return this.success(res);
  }

  // 新增积分记录由其他模块（如宝宝管理、喂养记录）调用，此处不暴露直接接口
}
