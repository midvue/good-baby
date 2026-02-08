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

  @Rule(RuleType.string().empty(''))
  @ApiProperty({
    description: '上一次查询的姓名',
    required: false,
    example: '张三',
  })
  lastFindName: string;

  //用户id
  @Rule(RuleType.string().empty(''))
  @ApiProperty({
    description: '用户id',
    required: false,
    example: '123456',
  })
  userId: string;
}

/**
 * AI 解释姓名请求参数 DTO
 */
export class AiInterpretDTO {
  @Rule(RuleType.array<string>().required())
  @ApiProperty({
    description: '婴儿姓名',
    required: true,
    example: '张三,李四',
  })
  names: string[];

  @Rule(RuleType.string().empty(''))
  @ApiProperty({
    description: '用户id',
    required: false,
    example: '123456',
  })
  userId: string;

  @Rule(RuleType.string().empty(''))
  @ApiProperty({
    description: '婴儿性别',
    required: false,
    example: '10',
  })
  gender: string;
}
