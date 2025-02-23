import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';

export class BtnDTO {
  @Rule(RuleType.string().allow(''))
  @ApiProperty({
    example: '添加',
    description: '按钮名',
  })
  name: string;

  @Rule(RuleType.string().allow('').empty(''))
  @ApiProperty({
    example: 'userMgr',
    description: '按钮编码',
  })
  code: string;

  @Rule(RuleType.string().allow(''))
  @ApiProperty({
    example: '',
    description: '按钮图标',
  })
  icon: string;

  @Rule(RuleType.number().allow('').empty(''))
  @ApiProperty({
    example: '',
    description: '排序',
  })
  orderNum: number;

  @Rule(RuleType.string().allow('').empty(''))
  @ApiProperty({
    example: '',
    description: '备注',
  })
  remark: string;
}

export class BtnCreateDTO extends BtnDTO {
  @Rule(RuleType.string().required())
  @ApiProperty({
    example: 'userMgr',
    description: '按钮编码',
  })
  code: string;
}

export class BtnUpdateDTO extends BtnDTO {
  @Rule(RuleType.number().allow(''))
  @ApiProperty({
    example: 1,
    description: '按钮id',
  })
  id: number;
}

export class BtnPageDTO extends BtnUpdateDTO {
  @Rule(RuleType.number().required().default(20))
  @ApiProperty({ example: 20, description: '每页条数' })
  size: number;

  @Rule(RuleType.number().required().default(1))
  @ApiProperty({ example: 1, description: '当前页码' })
  current: number;
}
