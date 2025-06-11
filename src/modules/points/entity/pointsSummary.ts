import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';

@Entity()
export class PointsSummary extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '用户ID' })
  userId: number;

  @Column({ comment: '统计日期，格式为 YYYY-MM-DD' })
  date: string;

  @Column({ comment: '积分总和', default: 0, name: 'total_points' })
  totalPoints: number;

  @Column({ comment: '今日积分', default: 0, name: 'today_points' })
  todayPoints: number;
}
