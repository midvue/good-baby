import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';

/** 宫缩记录分页查询DTO */
export class UterineRecordDTO {
  @ApiProperty({ description: '用户ID', example: 1 })
  @Rule(RuleType.string().allow('').empty(''))
  userId?: string;

  @ApiProperty({
    description: '开始时间（YYYY-MM-DD HH:mm:ss）',
    example: '2024-01-01 00:00:00',
  })
  @Rule(RuleType.string().allow(''))
  startTime?: string;

  @ApiProperty({
    description: '结束时间（YYYY-MM-DD HH:mm:ss）',
    example: '2024-01-31 23:59:59',
  })
  @Rule(RuleType.string().allow(''))
  endTime?: string;

  @ApiProperty({
    description: '持续时间（秒）',
    example: 60,
  })
  @Rule(RuleType.number().optional())
  duration?: number;

  @ApiProperty({
    description: '间隔时间（秒）',
    example: 60,
  })
  @Rule(RuleType.number().optional())
  interval?: number;
}

/** 宫缩记录分页查询DTO */
export class UterineRecordPageDTO extends UterineRecordDTO {
  @ApiProperty({ description: '每页条数', example: 20 })
  @Rule(RuleType.number().required().default(20))
  size: number;

  @ApiProperty({ description: '当前页码', example: 1 })
  @Rule(RuleType.number().required().default(1))
  current: number;
}
