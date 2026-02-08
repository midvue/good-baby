import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';

/**
 * 姓名表
 */
@Index('uk_name', ['name'], {
  unique: true,
})
@Entity('name', { comment: '姓名主表' })
export class Name extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '名称', length: 16, nullable: false })
  name: string;

  @Column({ comment: '性别(10:女,20:男)', length: 8 })
  gender: string;

  @Column({ comment: '姓名详情', type: 'json', nullable: true })
  desc: {
    /** 读音 */
    spell: string;
    /** 来源 */
    origin: string;
    /** 解释 */
    desc: string;
  };

  @Column({ comment: '次数', default: 0, type: 'int' })
  count: number;
}
