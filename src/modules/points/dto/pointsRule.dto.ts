import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';

/** 积分规则创建DTO */
export class PointsRuleCreateDTO {
  @ApiProperty({ description: '规则标识', example: 'follow_wechat' })
  @Rule(RuleType.string().required())
  ruleKey: string;

  @ApiProperty({ description: '规则描述', example: '关注公众号' })
  @Rule(RuleType.string().required())
  description: string;

  @ApiProperty({ description: '积分值', example: 200 })
  @Rule(RuleType.number().required())
  points: number;
}

/** 积分规则分页查询DTO */
export class PointsRulePageDTO {
  @ApiProperty({ description: '当前页码', example: 1 })
  @Rule(RuleType.number().required().default(1))
  current: number;

  @ApiProperty({ description: '每页条数', example: 20 })
  @Rule(RuleType.number().required().default(20))
  size: number;
}
