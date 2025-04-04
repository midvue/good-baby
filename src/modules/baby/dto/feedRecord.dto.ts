import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';

export class FeedRecordDTO {
  @Rule(RuleType.number().allow('').empty(''))
  @ApiProperty({
    example: 1,
    description: '创建人id',
  })
  createId: number;

  @Rule(RuleType.number().allow('').empty(''))
  @ApiProperty({
    example: '10',
    description: '喂养类型(10,20)',
  })
  feedType: number;

  @Rule(RuleType.string().allow(''))
  @ApiProperty({
    example: '2025-03-02 22:26:00',
    description: '喂养时间',
  })
  feedTime: string;

  @Rule(RuleType.string().allow(''))
  @ApiProperty({
    example: '2025-03-02 22:26:00',
    description: '起始喂养时间',
  })
  startFeedTime: string;

  @Rule(RuleType.string().allow(''))
  @ApiProperty({
    example: '2025-03-02 22:26:00',
    description: '结束喂养时间',
  })
  endFeedTime: string;

  @Rule(RuleType.object<Record<string, any>>().allow(null).default({}))
  @ApiProperty({
    example: '奶粉150ml',
    description: '字典内容',
  })
  content: JSON;
}

export class FeedRecordCreateDTO extends FeedRecordDTO {
  @Rule(RuleType.number().required())
  @ApiProperty({
    example: 1,
    description: '宝宝id',
  })
  babyId: number;
}

export class FeedRecordUpdateDTO extends FeedRecordDTO {
  @Rule(RuleType.number().allow('').empty(''))
  @ApiProperty({
    example: 1,
    description: '喂养id',
  })
  id: number;

  @Rule(RuleType.number().allow('').empty(''))
  @ApiProperty({
    example: 1,
    description: '宝宝id',
  })
  babyId: number;
}

export class FeedRecordPageDTO extends FeedRecordUpdateDTO {
  @Rule(RuleType.number().required().default(20))
  @ApiProperty({ example: 20, description: '每页条数' })
  size: number;

  @Rule(RuleType.number().required().default(1))
  @ApiProperty({ example: 1, description: '当前页码' })
  current: number;
}
