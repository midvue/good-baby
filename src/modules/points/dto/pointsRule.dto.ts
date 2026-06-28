import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';
import { EnumTaskType, EnumTriggerType } from '../constants';

/** 积分规则创建DTO */
export class PointsRuleCreateDTO {
  @ApiProperty({ description: '规则标识', example: 'daily_feed' })
  @Rule(RuleType.string().required())
  code: string;

  @ApiProperty({ description: '展示名称', example: '每日喂养' })
  @Rule(RuleType.string().required())
  title: string;

  @ApiProperty({ description: '规则描述', example: '每天记录喂养获得积分' })
  @Rule(RuleType.string().required())
  description: string;

  @ApiProperty({ description: '积分值', example: 10 })
  @Rule(RuleType.number().required())
  points: number;

  @ApiProperty({
    description: '触发方式 10:手动领取 20:自动到账',
    example: EnumTriggerType.AUTO,
  })
  @Rule(RuleType.string().valid(EnumTriggerType.MANUAL, EnumTriggerType.AUTO))
  triggerType: string;

  @ApiProperty({
    description: '任务类型 10:每日 20:一次性 30:行为触发',
    example: EnumTaskType.ACTION,
  })
  @Rule(
    RuleType.string().valid(
      EnumTaskType.DAILY,
      EnumTaskType.ONCE,
      EnumTaskType.ACTION
    )
  )
  taskType: string;

  @ApiProperty({
    description: '每日上限，0表示不限，仅ACTION类型生效',
    example: 50,
  })
  @Rule(RuleType.number().default(0))
  limitPerDay: number;
}

/** 积分规则更新DTO */
export class PointsRuleUpdateDTO extends PointsRuleCreateDTO {
  @ApiProperty({ description: '规则ID', example: 1 })
  @Rule(RuleType.number().required())
  id: number;
}

/** 积分规则分页查询DTO */
export class PointsRulePageDTO {
  @ApiProperty({ description: '当前页码', example: 1 })
  @Rule(RuleType.number().required().default(1))
  current: number;

  @ApiProperty({ description: '每页条数', example: 20 })
  @Rule(RuleType.number().required().default(20))
  size: number;
}
