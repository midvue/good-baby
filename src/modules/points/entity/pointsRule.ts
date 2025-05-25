import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';

@Entity()
export class PointsRule extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('uk_rule_Key', { unique: true })
  @Column({ comment: '规则标识', length: 25 })
  code: string;

  @Column({ comment: '规则描述' })
  description: string;

  @Column({ comment: '积分值' })
  points: number;
}
