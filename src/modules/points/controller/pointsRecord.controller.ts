import { Body, Controller, Inject, Post } from '@midwayjs/core';
import { ApiOperation, ApiTags } from '@midwayjs/swagger';
import { Validate } from '@midwayjs/validate';
import { BaseController } from '../../base/base.controller';
import {
  PointsConsumeDTO,
  PointsRecordDTO,
  PointsRecordPageDTO,
} from '../dto/pointsRecord.dto';
import { PointsRecordService } from '../service/pointsRecord.service';

@ApiTags('积分记录模块')
@Controller('/points/record', { description: '积分记录相关接口' })
export class PointsRecordController extends BaseController {
  @Inject()
  pointsRecordService: PointsRecordService;

  @Post('/page')
  @ApiOperation({ summary: '积分记录分页查询' })
  async page(@Body() dto: PointsRecordPageDTO) {
    // 不自动填充 uid，admin 可查全部用户，小程序传自己的 uid
    const res = await this.pointsRecordService.page(dto);
    return this.success(res);
  }

  @Post('/list')
  @ApiOperation({ summary: '积分任务列表查询' })
  async list(@Body() dto: PointsRecordDTO) {
    dto.userId = dto.userId || this.ctx.uid;
    const res = await this.pointsRecordService.list(dto);
    return this.success(res);
  }

  @Post('/update')
  @ApiOperation({ summary: '领取积分（MANUAL类型）' })
  async update(@Body() dto: PointsRecordDTO) {
    dto.userId = dto.userId || this.ctx.uid;
    const res = await this.pointsRecordService.update(dto);
    return this.success(res);
  }

  @Post('/consume')
  @Validate()
  @ApiOperation({ summary: '消耗积分（商品兑换）' })
  async consume(@Body() dto: PointsConsumeDTO) {
    const res = await this.pointsRecordService.consume(dto);
    return this.success(res);
  }
}
