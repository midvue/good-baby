import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';

/** 积分汇总查询DTO */
export class PointsSummaryDTO {
  @ApiProperty({ description: '用户ID', example: '1' })
  @Rule(RuleType.string().allow('').empty(''))
  userId?: string;
}

/** 积分汇总分页查询DTO */
export class PointsSummaryPageDTO extends PointsSummaryDTO {
  @ApiProperty({ description: '每页条数', example: 20 })
  @Rule(RuleType.number().required().default(20))
  size: number;

  @ApiProperty({ description: '当前页码', example: 1 })
  @Rule(RuleType.number().required().default(1))
  current: number;
}
