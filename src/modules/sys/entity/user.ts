import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';

/**
 * 用户表
 */
@Entity('sys_user')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'dept_id', comment: '部门id', default: 0 })
  deptId: number;

  @Index('uk_account', { unique: true })
  @Column({ comment: '账号', length: 32 })
  account: string;

  @Column({ comment: '密码', length: 36 })
  password: string;

  @Column({ comment: '昵称', length: 32 })
  nickname: string;

  @Column({ comment: '手机', length: 11, default: '' })
  phone: string;

  @Column({ comment: '年龄', default: 0 })
  age: number;

  @Column({ type: 'tinyint', comment: '性别- 0:男性,1:女性', default: 0 })
  gender: number;

  @Column({ type: 'tinyint', comment: '状态- 0:禁用 1：启用', default: 1 })
  status: number;

  @Column({ comment: '备注', length: 128, default: '' })
  remark: string;

  @Column({ name: 'creator_id', comment: '创建人id', default: 0 })
  creatorId: number;
}
