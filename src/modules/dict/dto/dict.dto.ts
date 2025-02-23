import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';

export class DictDTO {
  @Rule(RuleType.string().required())
  @ApiProperty({
    example: 'gender',
    description: '性别',
  })
  code: string;

  @Rule(RuleType.string().required())
  @ApiProperty({
    example: '性别字典',
    description: '名称',
  })
  name: string;

  @Rule(RuleType.string().required())
  @ApiProperty({
    example: '[{"code":"10","name":"女性"},{"code":"20","name":"男性"}]',
    description: '字典内容',
  })
  content: string;
}

export class DictCreateDTO extends DictDTO {}

export class DictUpdateDTO extends DictDTO {
  @Rule(RuleType.number().allow(''))
  @ApiProperty({
    example: 1,
    description: '字典id',
  })
  id: number;
}

export class DictPageDTO extends DictUpdateDTO {
  @Rule(RuleType.number().required().default(20))
  @ApiProperty({ example: 20, description: '每页条数' })
  size: number;

  @Rule(RuleType.number().required().default(1))
  @ApiProperty({ example: 1, description: '当前页码' })
  current: number;
}
