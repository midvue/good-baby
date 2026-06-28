import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';

/**
 * 积分规则表
 */
@Entity('points_rule', { comment: '积分规则表' })
export class PointsRule extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('uk_rule_code', { unique: true })
  @Column({ comment: '规则标识', length: 32 })
  code: string;

  @Column({ comment: '展示名称', length: 32 })
  title: string;

  @Column({ comment: '规则描述', length: 128 })
  description: string;

  @Column({ comment: '积分值', type: 'int' })
  points: number;

  @Column({
    comment: '触发方式 10:手动领取(MANUAL) 20:自动到账(AUTO)',
    length: 8,
    type: 'varchar',
    default: '10',
  })
  triggerType: string;

  @Column({
    comment: '任务类型 10:每日(DAILY) 20:一次性(ONCE) 30:行为触发(ACTION)',
    length: 8,
    type: 'varchar',
    default: '10',
  })
  taskType: string;

  @Column({
    comment: '每日上限，0表示不限，仅ACTION类型生效',
    type: 'int',
    default: 0,
  })
  limitPerDay: number;

  @Column({
    comment: '状态 0:禁用 1:启用',
    type: 'tinyint',
    default: 1,
  })
  status: number;
}
