import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';

export class MenuDTO {
  @Rule(RuleType.string().allow(''))
  @ApiProperty({
    example: '用户管理',
    description: '菜单名',
  })
  name: string;

  @Rule(RuleType.string().allow('').empty(''))
  @ApiProperty({
    example: 'userMgr',
    description: '菜单编码',
  })
  code: string;

  @Rule(RuleType.number().allow('').empty(''))
  @ApiProperty({
    example: 0,
    description: '父菜单ID',
  })
  pid: number;

  @Rule(RuleType.string().allow(''))
  @ApiProperty({
    example: '',
    description: '菜单url',
  })
  url: string;

  @Rule(RuleType.string().allow(''))
  @ApiProperty({
    example: '',
    description: '菜单图标',
  })
  icon: string;

  @Rule(RuleType.number().allow('').empty(''))
  @ApiProperty({
    example: '',
    description: '菜单类型(1:菜单,2:按钮)',
  })
  type: number;

  @Rule(RuleType.boolean().allow(''))
  @ApiProperty({
    example: false,
    description: '是否缓存(true:是,false:否)',
  })
  keepAlive: boolean;

  @Rule(RuleType.boolean().allow(''))
  @ApiProperty({
    example: true,
    description: '是否显示(true:是,false:否)',
  })
  isShow: boolean;

  @Rule(RuleType.number().allow('').empty(''))
  @ApiProperty({
    example: '',
    description: '排序)',
  })
  orderNum: number;
}

export class MenuCreateDTO extends MenuDTO {
  @Rule(RuleType.string().required())
  @ApiProperty({
    example: 'userMgr',
    description: '菜单编码',
  })
  code: string;
}

export class MenuUpdateDTO extends MenuDTO {
  @Rule(RuleType.number().allow(''))
  @ApiProperty({
    example: 1,
    description: '菜单id',
  })
  id: number;
}

export class MenuPageDTO extends MenuUpdateDTO {
  @Rule(RuleType.number().required().default(20))
  @ApiProperty({ example: 20, description: '每页条数' })
  size: number;

  @Rule(RuleType.number().required().default(1))
  @ApiProperty({ example: 1, description: '当前页码' })
  current: number;
}
