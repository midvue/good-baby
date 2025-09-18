import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';

/** 胎动记录DTO */
export class FetalMovementDTO {
  @ApiProperty({ description: '用户ID', example: 1 })
  @Rule(RuleType.string().allow('').empty(''))
  userId?: string;

  @ApiProperty({ description: '胎动次数', example: 1 })
  @Rule(RuleType.number().allow('').empty(''))
  count?: number;

  @ApiProperty({ description: '记录时间', example: '2025-01-01 00:00:00' })
  @Rule(RuleType.string().allow('').empty(''))
  recordTime?: string;

  @ApiProperty({ description: '预产期', example: '2025-01-01' })
  @Rule(RuleType.string().allow('').empty(''))
  expectDate?: string;
}
