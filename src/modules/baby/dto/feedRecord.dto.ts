import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';

export class FeedRecordDTO {
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
    example: '[{"code":"0","name":"女性"},{"code":"1","name":"男性"}]',
    description: '字典内容',
  })
  content: string;
}

export class FeedRecordCreateDTO extends FeedRecordDTO {}

export class FeedRecordUpdateDTO extends FeedRecordDTO {
  @Rule(RuleType.number().allow(''))
  @ApiProperty({
    example: 1,
    description: '字典id',
  })
  id: number;
}

export class FeedRecordPageDTO extends FeedRecordUpdateDTO {
  @Rule(RuleType.number().required().default(20))
  @ApiProperty({ example: 20, description: '每页条数' })
  size: number;

  @Rule(RuleType.number().required().default(1))
  @ApiProperty({ example: 1, description: '当前页码' })
  current: number;
}
