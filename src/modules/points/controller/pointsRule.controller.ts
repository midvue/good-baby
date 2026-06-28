import { Body, Controller, Post, Put, Inject } from '@midwayjs/core';
import { ApiOperation, ApiTags } from '@midwayjs/swagger';
import { Validate } from '@midwayjs/validate';
import { BaseController } from '../../base/base.controller';
import { PointsRuleService } from '../service/pointsRule.service';
import {
  PointsRuleCreateDTO,
  PointsRulePageDTO,
  PointsRuleUpdateDTO,
} from '../dto/pointsRule.dto';

@ApiTags('积分规则模块')
@Controller('/points/rule', { description: '积分规则相关接口' })
export class PointsRuleController extends BaseController {
  @Inject()
  pointsRuleService: PointsRuleService;

  @Post('/page')
  @ApiOperation({ summary: '积分规则分页查询' })
  async page(@Body() dto: PointsRulePageDTO) {
    const res = await this.pointsRuleService.page(dto);
    return this.success(res);
  }

  @Post('/create')
  @Validate()
  @ApiOperation({ summary: '创建积分规则' })
  async create(@Body() dto: PointsRuleCreateDTO) {
    const res = await this.pointsRuleService.create(dto);
    return this.success(res);
  }

  @Put('/update')
  @Validate()
  @ApiOperation({ summary: '更新积分规则' })
  async update(@Body() dto: PointsRuleUpdateDTO) {
    const res = await this.pointsRuleService.update(dto);
    return this.success(res);
  }

  @Put('/enable')
  @ApiOperation({ summary: '启用积分规则' })
  async enable(@Body('id') id: number) {
    const res = await this.pointsRuleService.enable(id);
    return this.success(res);
  }

  @Put('/disable')
  @ApiOperation({ summary: '禁用积分规则' })
  async disable(@Body('id') id: number) {
    const res = await this.pointsRuleService.disable(id);
    return this.success(res);
  }
}
