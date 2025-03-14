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

  @Rule(RuleType.string().allow(''))
  @ApiProperty({
    example: '2025-12-18',
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
    example: 'https://',
    description: '头像',
  })
  avatar: string;
}

export class BabyCreateDTO extends BabyDTO {
  @Rule(RuleType.number().allow(''))
  @ApiProperty({
    example: 1,
    description: '用户id',
  })
  userId: number;

  @Rule(RuleType.number().allow(''))
  @ApiProperty({
    example: 1,
    description: '自己创建的家庭id',
  })
  familyId: number;
}

export class BabyListDTO extends BabyDTO {
  @Rule(RuleType.number().allow(''))
  @ApiProperty({
    example: 1,
    description: '宝宝id',
  })
  id: number;

  @Rule(RuleType.number().allow(''))
  @ApiProperty({
    example: 1,
    description: '家庭id',
  })
  familyId: number;

  @Rule(RuleType.number().allow(''))
  @ApiProperty({
    example: 1,
    description: '当前账号id',
  })
  userId: number;
}

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
