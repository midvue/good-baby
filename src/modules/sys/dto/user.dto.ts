import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';

export class UserDTO {
  @Rule(RuleType.string().allow('').empty(''))
  @ApiProperty({
    example: 'admin',
    description: '账号',
  })
  account: string;

  @Rule(RuleType.string().allow('').empty(''))
  @ApiProperty({
    example: 'admin',
    description: '昵称',
  })
  nickname: string;

  @Rule(RuleType.string().allow('').empty(''))
  @ApiProperty({
    example: 18122223333,
    description: '手机号',
  })
  phone: string;

  @Rule(RuleType.number().empty(''))
  @ApiProperty({
    description: '部门id',
  })
  deptId: number;

  @Rule(RuleType.number().empty(''))
  @ApiProperty({
    description: '性别(0:男性,1:女性)',
  })
  gender: number;

  @Rule(RuleType.string().allow(''))
  @ApiProperty({
    description: '备注',
  })
  remark: string;

  @Rule(RuleType.array().items(RuleType.number()).allow('').empty(''))
  @ApiProperty({
    example: [1, 2, 3],
    description: '角色编号列表',
  })
  roleIds: number[];
}

export class UserCreateDTO extends UserDTO {
  @Rule(RuleType.string().required())
  @ApiProperty({
    example: 'admin',
    description: '账号',
  })
  account: string;

  @Rule(RuleType.string().required())
  @ApiProperty({
    example: '123456',
    description: '密码',
  })
  password: string;
}

export class UserUpdateDTO extends UserDTO {
  @Rule(RuleType.number().allow(''))
  @ApiProperty({
    example: 1,
    description: '角色id',
  })
  id: number;
}

export class UserPageDTO extends UserUpdateDTO {
  @Rule(RuleType.number().required().default(20))
  @ApiProperty({ example: 20, description: '每页条数' })
  size: number;

  @Rule(RuleType.number().required().default(1))
  @ApiProperty({ example: 1, description: '当前页码' })
  current: number;
}
