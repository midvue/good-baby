import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { BaseEntity, SnowIdBaseEntity } from '../../base/base.entity';

/**
 * 用户端账号表
 */
@Entity('app_account')
export class Account extends SnowIdBaseEntity {
  @Index('uk_account', { unique: true })
  @Column({ comment: '账号', length: 32, default: null })
  account: string;

  @Column({ comment: '密码', length: 36, default: null })
  password: string;

  @Index('uk_open_id', { unique: true })
  @Column({ comment: '微信openid', length: 32, default: null })
  openid: string;

  @Index('uk_union_id', { unique: true })
  @Column({
    name: 'unionid',
    comment: '微信unionId',
    length: 32,
    default: null,
  })
  unionid: string;

  @Column({ comment: '昵称', length: 32, default: null })
  nickname: string;

  @Column({ comment: '手机', length: 11, default: '' })
  phone: string;

  @Column({ comment: '年龄', default: 0 })
  age: number;

  @Column({ length: 2, comment: '性别- 20:男性,10:女性', default: '' })
  gender: string;
}
