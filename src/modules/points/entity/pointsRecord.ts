import { Column, Entity, Index } from 'typeorm';
import { SnowIdBaseEntity } from '../../base/base.entity';

/**
 * 积分记录表（积分流水）
 */
@Entity('points_record', { comment: '积分记录表' })
export class PointsRecord extends SnowIdBaseEntity {
  @Index('idx_user_id', ['userId'])
  @Column({ comment: '用户ID', length: 32 })
  userId: string;

  @Column({ comment: '规则编码', length: 32, name: 'rule_code' })
  ruleCode: string;

  @Column({ comment: '积分变动值（正数为获得，负数为消耗）', type: 'int' })
  points: number;

  @Column({
    comment: '积分状态 10:待领取(PENDING) 20:已到账(SETTLED)',
    length: 8,
    type: 'varchar',
    default: '20',
    nullable: true,
  })
  status: string;

  @Column({
    comment: '变动类型 10:获得(EARN) 20:消耗(CONSUME)',
    length: 8,
    type: 'varchar',
    name: 'change_type',
  })
  changeType: string;

  @Column({
    comment: '关联业务ID（如喂养记录ID）',
    length: 32,
    name: 'source_id',
    nullable: true,
  })
  sourceId?: string;

  @Column({ comment: '备注信息', length: 128, nullable: true })
  remark?: string;
}
