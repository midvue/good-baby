import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';

export class RoleDTO {
  @Rule(RuleType.string().allow(''))
  @ApiProperty({
    example: '超级管理员',
    description: '角色名',
  })
  name: string;

  @Rule(RuleType.string().allow('').empty(''))
  @ApiProperty({
    example: 'admin',
    description: '角色编码',
  })
  code: string;

  @Rule(RuleType.number())
  @ApiProperty({
    example: 0,
    description: '父角色ID',
  })
  pid: number;

  @Rule(RuleType.number().allow('').empty(''))
  @ApiProperty({
    description: '状态',
  })
  status: number;

  @Rule(RuleType.string().allow(''))
  @ApiProperty({
    example: '',
    description: '备注',
  })
  remark: string;
}

export class RoleCreateDTO extends RoleDTO {
  @Rule(RuleType.string().required())
  @ApiProperty({
    example: 'admin',
    description: '角色编码',
  })
  code: string;
}

export class RoleUpdateDTO extends RoleDTO {
  @Rule(RuleType.number().allow(''))
  @ApiProperty({
    example: 1,
    description: '角色id',
  })
  id: number;
}

export class RolePageDTO extends RoleUpdateDTO {
  @Rule(RuleType.number().required().default(20))
  @ApiProperty({ example: 20, description: '每页条数' })
  size: number;

  @Rule(RuleType.number().required().default(1))
  @ApiProperty({ example: 1, description: '当前页码' })
  current: number;
}

export class RoleUpStatusDTO {
  @Rule(RuleType.number().required())
  @ApiProperty({
    example: 1,
    description: '角色id',
  })
  id: number;

  @Rule(RuleType.number().required())
  @ApiProperty({
    description: '状态',
  })
  status: number;
}

export class RoleMenuUpDTO {
  @Rule(RuleType.array().items(RuleType.number()).required())
  @ApiProperty({
    example: [1, 2, 3, 4],
    description: '当前选中菜单ids',
  })
  menuIds: number[];

  @Rule(RuleType.number().required())
  @ApiProperty({
    example: 1,
    description: '角色id',
  })
  roleId: number;
}
