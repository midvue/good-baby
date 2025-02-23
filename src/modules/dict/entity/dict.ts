import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';

/**
 * 字典表
 */
@Entity('dict')
export class Dict extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('uk_code', { unique: true })
  @Column({ comment: '编码', length: 36 })
  code: string;

  @Column({ comment: '名称', length: 32 })
  name: string;

  @Column({ comment: '内容', type: 'json' })
  content: string;
}
