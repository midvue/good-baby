import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';

/** 积分记录分页查询DTO */
export class PointsRecordDTO {
  @ApiProperty({ description: '用户ID', example: 1 })
  @Rule(RuleType.number().allow('').empty(''))
  userId?: number;

  @ApiProperty({
    description: '变动开始日期（YYYY-MM-DD）',
    example: '2024-01-01',
  })
  @Rule(RuleType.string().allow(''))
  startDate?: string;

  @ApiProperty({
    description: '变动结束日期（YYYY-MM-DD）',
    example: '2024-01-31',
  })
  @Rule(RuleType.string().allow(''))
  endDate?: string;

  @Rule(RuleType.string().allow(''))
  code?: string;
}

/** 积分记录分页查询DTO */
export class PointsRecordPageDTO extends PointsRecordDTO {
  @ApiProperty({ description: '每页条数', example: 20 })
  @Rule(RuleType.number().required().default(20))
  size: number;

  @ApiProperty({ description: '当前页码', example: 1 })
  @Rule(RuleType.number().required().default(1))
  current: number;
}
