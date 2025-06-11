import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseEntity, snowflakeTransformer } from '../../base/base.entity';
import { EnumYesNoPlus } from '@mid-vue/shared';

@Entity()
export class PointsRecord extends BaseEntity {
  @PrimaryColumn({
    comment: '主键ID',
    type: 'bigint',
    unique: true,
    nullable: false,
    transformer: snowflakeTransformer,
  })
  id: string;

  @Column({ comment: '用户ID' })
  userId: number;

  @Column({ comment: '规则编码', length: 32, name: 'rule_code' })
  ruleCode: string;

  @Column({ comment: '积分变动值' })
  points: number;

  @Column({
    comment: '积分完成状态 10 未完成，20 已完成，30 已领取',
    length: 8,
    type: 'varchar',
  })
  status: string;

  @Column({
    comment: '积分变动类型，10 为增加，20 为减少',
    length: 8,
    type: 'varchar',
    name: 'change_type',
  })
  changeType: EnumYesNoPlus;

  @Column({ comment: '备注信息', nullable: true })
  remark?: string;
}
