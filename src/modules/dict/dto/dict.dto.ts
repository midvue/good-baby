import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';

export class DictDTO {
  @Rule(RuleType.string().allow('').empty(''))
  @ApiProperty({
    example: 'GENDER',
    description: '性别字典code',
  })
  code: string;

  @Rule(RuleType.string().allow(''))
  @ApiProperty({
    example: '性别字典',
    description: '名称',
  })
  name: string;

  @Rule(RuleType.array<string>().empty(''))
  @ApiProperty({
    example: '[GENDER]',
    description: '字典code数组',
  })
  codes: string[];
}

export class DictCreateDTO extends DictDTO {
  @Rule(RuleType.string().required())
  @ApiProperty({
    example: 'dict_gender',
    description: '性别字典code',
  })
  code: string;

  @Rule(RuleType.string().allow(null).default([]))
  @ApiProperty({
    example: '[{"code":"10","name":"女性"},{"code":"20","name":"男性"}]',
    description: '字典内容列表',
  })
  list: JSON;
}

export class DictUpdateDTO extends DictDTO {
  @Rule(RuleType.number().allow('').empty(''))
  @ApiProperty({
    example: 1,
    description: '字典id',
  })
  id: number;

  @Rule(RuleType.array())
  @ApiProperty({
    example: [
      { code: '10', name: '女性' },
      { code: '20', name: '男性' },
    ],
    description: '字典内容列表',
  })
  list: JSON;
}

export class DictPageDTO extends DictUpdateDTO {
  @Rule(RuleType.number().required().default(20))
  @ApiProperty({ example: 20, description: '每页条数' })
  size: number;

  @Rule(RuleType.number().required().default(1))
  @ApiProperty({ example: 1, description: '当前页码' })
  current: number;
}
