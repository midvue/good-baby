import { Body, Controller, Inject, Post } from '@midwayjs/core';
import { ApiOperation, ApiTags } from '@midwayjs/swagger';
import { BaseController } from '../../base/base.controller';
import { FetalMovementService } from '../service/fetalMovement.service';
import { FetalMovementDTO } from '../dto/fetalMovement.dto';

@ApiTags('胎动记录')
@Controller('/centre/fetalMovement', { description: '胎动记录相关接口' })
export class FetalMovementController extends BaseController {
  @Inject()
  fetalMovementService: FetalMovementService;

  @Post('/list')
  @ApiOperation({ summary: '胎动记录列表查询' })
  async list(@Body() dto: FetalMovementDTO) {
    dto.userId = dto.userId || this.ctx.uid;
    const res = await this.fetalMovementService.list(dto);
    return this.success(res);
  }

  @Post('/add')
  @ApiOperation({ summary: '胎动记录添加' })
  async add(@Body() dto: FetalMovementDTO) {
    dto.userId = dto.userId || this.ctx.uid;
    const res = await this.fetalMovementService.add(dto);
    return this.success(res);
  }
}
