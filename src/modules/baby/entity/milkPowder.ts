import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';

/**
 * 奶粉管理
 */
@Entity('baby_milk_powder', { comment: '宝宝奶粉管理' })
export class MilkPowder extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '品牌', length: 32 })
  brand: string;

  @Column({ comment: '种类', type: 'tinyint' })
  type: number;

  @Column({ comment: '名称', length: 32 })
  name: string;

  @Column({ comment: '价格', type: 'decimal' })
  price: number;

  @Column({ comment: '产地', length: 32 })
  from: string;

  @Column({ comment: '阶段', type: 'tinyint' })
  level: number;
}
