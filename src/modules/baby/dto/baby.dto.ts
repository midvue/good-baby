import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';

export class BabyDTO {
  @Rule(RuleType.string().allow(''))
  @ApiProperty({
    example: '10',
    description: '性别',
  })
  gender: '10' | '20';

  @Rule(RuleType.string().allow(''))
  @ApiProperty({
    example: '测试',
    description: '昵称',
  })
  nickname: string;

  @Rule(RuleType.string().allow(''))
  @ApiProperty({
    example: 1,
    description: '家庭id',
  })
  familyId: string;

  @Rule(RuleType.number().allow(''))
  @ApiProperty({
    example: '3.3',
    description: '体重',
  })
  weight: number;

  @Rule(RuleType.string().allow(''))
  @ApiProperty({
    example: '2024-12-18',
    description: '出生日期',
  })
  birthDate: string;

  @Rule(RuleType.string().allow(''))
  @ApiProperty({
    example: '05:55',
    description: '出生时间',
  })
  birthTime: string;

  @Rule(RuleType.string().allow('').empty(null))
  @ApiProperty({
    example: '',
    description: '头像',
  })
  avatar: string;

  @Rule(RuleType.string().allow('').empty(null))
  @ApiProperty({
    example: '100',
    description: '妈妈',
  })
  relation: string;
}

export class BabyCreateDTO extends BabyDTO {
  @Rule(RuleType.string().allow(''))
  @ApiProperty({
    example: 1,
    description: '用户id',
  })
  userId: string;

  @Rule(RuleType.string())
  @ApiProperty({
    example: '100',
    description: '妈妈',
  })
  relation: string;
}

export class BabyListDTO extends BabyDTO {
  @Rule(RuleType.number().allow(''))
  @ApiProperty({
    example: 1,
    description: '宝宝id',
  })
  id: string;

  @Rule(RuleType.number().allow(''))
  @ApiProperty({
    example: 1,
    description: '当前账号id',
  })
  userId: string;
}

export class BabyUpdateDTO extends BabyDTO {
  @Rule(RuleType.string().required())
  @ApiProperty({
    example: 1,
    description: 'id',
  })
  id: string;

  @Rule(RuleType.string().required())
  @ApiProperty({
    example: 1,
    description: '宝宝家庭id',
  })
  familyId: string;
}

export class BabyPageDTO extends BabyUpdateDTO {
  @Rule(RuleType.number().required().default(20))
  @ApiProperty({ example: 20, description: '每页条数' })
  size: number;

  @Rule(RuleType.number().required().default(1))
  @ApiProperty({ example: 1, description: '当前页码' })
  current: number;
}
