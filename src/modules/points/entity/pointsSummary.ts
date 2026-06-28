import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';

/**
 * 积分汇总表（每用户一行）
 */
@Entity('points_summary', { comment: '积分汇总表' })
export class PointsSummary extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('uk_user', { unique: true })
  @Column({ comment: '用户ID', length: 32 })
  userId: string;

  @Column({
    comment: '当前可用余额',
    type: 'int',
    default: 0,
    name: 'total_points',
  })
  totalPoints: number;

  @Column({
    comment: '累计获得积分',
    type: 'int',
    default: 0,
    name: 'earned_points',
  })
  earnedPoints: number;

  @Column({
    comment: '累计消耗积分',
    type: 'int',
    default: 0,
    name: 'consumed_points',
  })
  consumedPoints: number;
}
