import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';

/**
 * 姓名-关键词表
 */
@Index('uk_keyword', ['keyword'], {
  unique: true,
})
@Entity('name_keyword', { comment: '姓名-关键词表' })
export class NameKeyword extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '关键词', length: 16 })
  keyword: string;

  @Column({ comment: '使用次数', default: 0, type: 'int' })
  count: number;
}
