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

  @Column({ comment: '当日积分总和' })
  totalPoints: number;
}
