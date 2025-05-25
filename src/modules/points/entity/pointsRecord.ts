import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';

@Entity()
export class PointsRecord extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '用户ID' })
  userId: number;

  @Column({ comment: '规则编码', length: 25 })
  ruleCode: string;

  @Column({ comment: '积分变动值' })
  points: number;

  @Column({ comment: '积分变动类型，10 为增加，20 为减少', length: 2 })
  changeType: string;

  @Column({ comment: '备注信息', nullable: true })
  remark?: string;
}
