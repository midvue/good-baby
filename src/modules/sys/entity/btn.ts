import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';

/**
 * 基础按钮表
 */
@Entity('sys_basic_btn')
export class Btn extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('uk_code', { unique: true })
  @Column({ comment: '按钮编码', length: 16 })
  code: string;

  @Column({ comment: '按钮名称', length: 32, default: '' })
  name: string;

  @Column({ comment: '图标', length: 32, default: '' })
  icon: string;

  @Column({ name: 'order_num', comment: '排序', default: 0 })
  orderNum: number;

  @Column({ comment: '备注', length: 64, default: '' })
  remark: string;

  @Column({ name: 'creator_id', comment: '创建人id', default: 0 })
  creatorId: number;
}
