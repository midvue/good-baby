import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';
import { EnumChangeType } from '../constants';

/** 积分记录查询DTO */
export class PointsRecordDTO {
  @ApiProperty({ description: '用户ID', example: '1' })
  @Rule(RuleType.string().allow('').empty(''))
  userId?: string;

  @ApiProperty({
    description: '规则编码',
    example: 'daily_feed',
  })
  @Rule(RuleType.string().allow(''))
  ruleCode?: string;

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

  @ApiProperty({
    description: '变动类型 10:获得 20:消耗',
    example: EnumChangeType.EARN,
  })
  @Rule(RuleType.string().allow('').empty(''))
  changeType?: string;

  @ApiProperty({ description: '规则标识', example: 'daily_feed' })
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

/** 积分消耗DTO */
export class PointsConsumeDTO {
  @ApiProperty({ description: '用户ID', example: '1' })
  @Rule(RuleType.string().required())
  userId: string;

  @ApiProperty({ description: '消耗积分值（正数）', example: 100 })
  @Rule(RuleType.number().positive().required())
  points: number;

  @ApiProperty({ description: '备注信息', example: '商品兑换' })
  @Rule(RuleType.string().allow('').max(128))
  remark?: string;
}
