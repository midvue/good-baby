import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';

/**
 * AI 请求参数 DTO
 */
export class AINameDTO {
  @Rule(RuleType.string().required())
  @ApiProperty({
    description: '婴儿姓氏',
    required: true,
    example: '朱',
  })
  surname: string;

  @Rule(RuleType.string().empty(''))
  @ApiProperty({
    description: '婴儿性别',
    required: false,
    example: '10',
  })
  gender: string;

  //出生年月
  @Rule(RuleType.string().empty(''))
  @ApiProperty({
    description: '婴儿出生年月',
    required: false,
    example: '2025-7-31',
  })
  birthDate: string;

  //出生时间
  @Rule(RuleType.string().empty(''))
  @ApiProperty({
    description: '婴儿出生时间',
    required: false,
    example: '12:00:00',
  })
  birthTime: string;

  //备注
  @Rule(RuleType.string().empty(''))
  @ApiProperty({
    description: '备注',
    required: false,
    example: '平凡的人',
  })
  remark: string;
}
