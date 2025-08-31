import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';
import { FeedRecordDTO } from './feedRecord.dto';

export class FeedRecordStatisticsDTO {
  @Rule(RuleType.string().allow('').empty(''))
  @ApiProperty({
    example: [
      {
        createId: 1,
        count: 10,
      },
    ],
    description: '创建用户',
  })
  createUsers: JSON;

  @Rule(RuleType.string().allow('').empty(''))
  @ApiProperty({
    example: [
      {
        type: 10,
        count: 10,
        sum: 10,
      },
    ],
    description: '喂养类型的统计数据',
  })
  feedTypeInfo: JSON;

  @Rule(RuleType.string().allow(''))
  @ApiProperty({
    example: '2025-08-31',
    description: '喂养日期',
  })
  feedDate: string;

  @Rule(RuleType.string().allow(''))
  @ApiProperty({
    example: '2025-08-25',
    description: '起始喂养日期',
  })
  startFeedDate: string;

  @Rule(RuleType.string().allow(''))
  @ApiProperty({
    example: '2025-08-31',
    description: '结束喂养日期',
  })
  endFeedDate: string;
}

export class FeedRecordCreateDTO extends FeedRecordStatisticsDTO {
  @Rule(RuleType.string().required())
  @ApiProperty({
    example: 1,
    description: '宝宝id',
  })
  babyId: string;
}

export class FeedRecordUpdateDTO extends FeedRecordStatisticsDTO {
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
