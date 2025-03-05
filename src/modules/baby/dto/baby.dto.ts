import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';

export class BabyDTO {
  @Rule(RuleType.number().allow(''))
  @ApiProperty({
    example: 'gender',
    description: '性别',
  })
  gender: number;

  @Rule(RuleType.string().allow(''))
  @ApiProperty({
    example: 'gender',
    description: '昵称',
  })
  nickname: string;

  @Rule(RuleType.number().allow(''))
  @ApiProperty({
    example: 'gender',
    description: '年龄',
  })
  age: number;

  @Rule(RuleType.number().allow(''))
  @ApiProperty({
    example: 'gender',
    description: '体重',
  })
  weight: number;

  @Rule(RuleType.number().allow(''))
  @ApiProperty({
    example: 'gender',
    description: '出生日期',
  })
  birthTime: number;

  @Rule(RuleType.string().allow(''))
  @ApiProperty({
    example: 'https://',
    description: '头像',
  })
  avatar: string;
}

export class BabyCreateDTO extends BabyDTO {}

export class BabyUpdateDTO extends BabyDTO {
  @Rule(RuleType.number().allow(''))
  @ApiProperty({
    example: 1,
    description: 'id',
  })
  id: number;
}

export class BabyPageDTO extends BabyUpdateDTO {
  @Rule(RuleType.number().required().default(20))
  @ApiProperty({ example: 20, description: '每页条数' })
  size: number;

  @Rule(RuleType.number().required().default(1))
  @ApiProperty({ example: 1, description: '当前页码' })
  current: number;
}
