import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';

export class FeedRecordDTO {
  @Rule(RuleType.string().allow('').empty(''))
  @ApiProperty({
    example: 1,
    description: '创建人id',
  })
  createId: string;

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

  @Rule(RuleType.string().allow(''))
  @ApiProperty({
    example: '',
    description: '备注',
  })
  remark: string;

  @Rule(RuleType.object<Record<string, any>>().allow(null).default({}))
  @ApiProperty({
    example: '{}',
    description: '字典内容',
  })
  content: Record<string, any>;
}

export class FeedRecordCreateDTO extends FeedRecordDTO {
  @Rule(RuleType.string().required())
  @ApiProperty({
    example: 1,
    description: '宝宝id',
  })
  babyId: string;
}

export class FeedRecordUpdateDTO extends FeedRecordDTO {
  @Rule(RuleType.string().allow('').empty(''))
  @ApiProperty({
    example: 1,
    description: '喂养id',
  })
  id: string;

  @Rule(RuleType.string().allow('').empty(''))
  @ApiProperty({
    example: 1,
    description: '宝宝id',
  })
  babyId: string;
}

export class FeedRecordPageDTO extends FeedRecordUpdateDTO {
  @Rule(RuleType.number().required().default(20))
  @ApiProperty({ example: 20, description: '每页条数' })
  size: number;

  @Rule(RuleType.number().required().default(1))
  @ApiProperty({ example: 1, description: '当前页码' })
  current: number;
}

export class LatestFeedRecordDto extends FeedRecordCreateDTO {
  @Rule(RuleType.array().items(RuleType.number()).required())
  @ApiProperty({ example: [10, 20], description: '喂养类型' })
  feedTypes: Array<number>;
}

export class FeedRecordDaysDTO extends FeedRecordDTO {
  @Rule(RuleType.string().required())
  @ApiProperty({ example: 1, description: '宝宝id' })
  babyId: string;
}

/**
 * 按天分页查询喂养记录入参
 * - 分页单位为"天",某一天的全部记录必定在同一页返回
 * - count 语义为"总有记录的天数",非总记录数
 */
export class FeedRecordPageByDayDTO {
  @Rule(RuleType.string().required())
  @ApiProperty({ example: 1, description: '宝宝id' })
  babyId: string;

  @Rule(RuleType.number().allow('').empty(''))
  @ApiProperty({ example: 10, description: '喂养类型(10,20,30),可选' })
  feedType?: number;

  @Rule(RuleType.number().required().default(1))
  @ApiProperty({ example: 1, description: '当前页码 (天级分页)' })
  current: number;

  @Rule(RuleType.number().required().default(2).max(31))
  @ApiProperty({ example: 2, description: '每页天数,默认2,最大31' })
  size: number;
}
