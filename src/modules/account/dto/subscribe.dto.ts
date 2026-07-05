import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';
import { EnumSubscribeStatus } from '../../../constants/dict';

/** 单条订阅授权结果 */
export class SubscribeReportItemDTO {
  @Rule(RuleType.string().required())
  @ApiProperty({
    example: 'feed_reminder_template_id',
    description: '模板id',
  })
  templateId: string;

  @Rule(
    RuleType.string()
      .valid(
        EnumSubscribeStatus.ACCEPT,
        EnumSubscribeStatus.REJECT,
        EnumSubscribeStatus.BAN,
        EnumSubscribeStatus.FILTER
      )
      .required()
  )
  @ApiProperty({
    example: 'accept',
    description: '授权结果 accept|reject|ban|filter',
  })
  status: string;
}

/** 订阅授权上报入参 */
export class SubscribeReportDTO {
  @Rule(
    RuleType.array()
      .items(
        RuleType.object({
          templateId: RuleType.string().required(),
          status: RuleType.string().required(),
        })
      )
      .required()
  )
  @ApiProperty({ description: '授权结果列表', type: [SubscribeReportItemDTO] })
  list: SubscribeReportItemDTO[];
}

/** 手动触发下发入参（联调用） */
export class SubscribeTriggerDTO {
  @Rule(RuleType.string().valid('feedReminder', 'weeklyReport').required())
  @ApiProperty({
    example: 'feedReminder',
    description: '触发类型：feedReminder=喂养提醒 / weeklyReport=周报',
  })
  type: string;

  @Rule(RuleType.string().empty(''))
  @ApiProperty({
    example: '',
    description: '指定宝宝 id（可选，不传则全量扫描）',
    required: false,
  })
  babyId?: string;
}
