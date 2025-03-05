import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';

/**
 * 宝宝管理
 */
@Entity('baby', { comment: '宝宝管理' })
export class Baby extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '昵称', length: 32 })
  nickname: string;

  @Column({ comment: '年龄', default: 0 })
  age: number;

  @Column({ type: 'tinyint', comment: '性别- 1:男性,0:女性', default: 0 })
  gender: number;

  @Column({ type: 'int', comment: '体重', default: 0 })
  weight: number;

  @Column({ name: 'birth_time', comment: '出生日期', type: 'timestamp' })
  birthTime: number;

  @Column({ comment: '头像', length: 128 })
  avatar: string;
}
