import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';

/**
 * 用户端账号表
 */
@Entity('app_account')
export class Account extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('uk_account', { unique: true })
  @Column({ comment: '账号', length: 32 })
  account: string;

  @Column({ comment: '密码', length: 36 })
  password: string;

  @Index('uk_open_id', { unique: true })
  @Column({ comment: '微信openId', length: 32 })
  openId: string;

  @Index('uk_union_id', { unique: true })
  @Column({ name: 'union_id', comment: '微信unionId', length: 32 })
  unionId: string;

  @Column({ comment: '昵称', length: 32 })
  nickname: string;

  @Column({ comment: '手机', length: 11, default: '' })
  phone: string;

  @Column({ comment: '年龄', default: 0 })
  age: number;

  @Column({ type: 'tinyint', comment: '性别- 0:男性,1:女性', default: 0 })
  gender: number;
}
