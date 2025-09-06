import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';

/** 红包记录DTO */
export class RedPacketDTO {
  @ApiProperty({ description: '用户ID', example: 1 })
  @Rule(RuleType.string().allow('').empty(''))
  userId?: string;

  @ApiProperty({ description: '宝宝ID', example: 1 })
  @Rule(RuleType.string().allow('').empty(''))
  babyId?: string;

  @ApiProperty({
    description: '记录时间（YYYY-MM-DD HH:mm:ss）',
    example: '2025-01-01 00:00:00',
  })
  @Rule(RuleType.string().allow(''))
  recordTime?: string;

  @ApiProperty({
    description: '红包类型',
    example: 1,
  })
  @Rule(RuleType.number().allow(''))
  type?: number;

  @ApiProperty({
    description: '姓名',
    example: '张三',
  })
  @Rule(RuleType.string().optional())
  name?: string;

  @ApiProperty({
    description: '称呼',
    example: '张三',
  })
  @Rule(RuleType.string().optional())
  callName?: string;

  @ApiProperty({
    description: '金额',
    example: 100,
  })
  @Rule(RuleType.number().optional())
  amount?: number;
}

/** 红包记录分页查询DTO */
export class RedPacketPageDTO extends RedPacketDTO {
  @ApiProperty({ description: '每页条数', example: 20 })
  @Rule(RuleType.number().required().default(20))
  size: number;

  @ApiProperty({ description: '当前页码', example: 1 })
  @Rule(RuleType.number().required().default(1))
  current: number;
}

export class RedPacketUpdateDTO extends RedPacketDTO {
  @Rule(RuleType.string().required())
  @ApiProperty({
    example: 1,
    description: 'id',
  })
  id: string;
}
