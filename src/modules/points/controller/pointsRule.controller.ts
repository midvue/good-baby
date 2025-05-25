import { Body, Controller, Post, Inject } from '@midwayjs/core';
import { ApiOperation, ApiTags } from '@midwayjs/swagger';
import { Validate } from '@midwayjs/validate';
import { BaseController } from '../../base/base.controller';
import { PointsRuleService } from '../service/pointsRule.service';
import { PointsRuleCreateDTO, PointsRulePageDTO } from '../dto/pointsRule.dto';

@ApiTags('积分规则模块')
@Controller('/points/rule', { description: '积分规则相关接口' })
export class PointsRuleController extends BaseController {
  @Inject()
  pointsRuleService: PointsRuleService;

  @Post('/page')
  @ApiOperation({ summary: '积分规则分页查询' })
  async getPage(@Body() dto: PointsRulePageDTO) {
    const res = await this.pointsRuleService.getPage(dto);
    return this.success(res);
  }

  @Post('/create')
  @ApiOperation({ summary: '创建积分规则' })
  async create(@Body() dto: PointsRuleCreateDTO) {
    const res = await this.pointsRuleService.create(dto);
    return this.success(res);
  }
}
