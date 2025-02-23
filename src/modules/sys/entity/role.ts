import { Column, Index, PrimaryGeneratedColumn, Entity } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';

/**
 * 角色表
 */
@Entity('sys_role')
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('uk_code', { unique: true })
  @Column({ comment: '角色编码', length: 48, nullable: false })
  code: string;

  @Column({ comment: '角色名称', length: 64, default: '' })
  name: string;

  @Column({
    comment: '父角色ID',
    default: 0,
  })
  pid: number;

  @Column({ comment: '排序', default: 0 })
  order: number;

  @Column({
    name: 'status',
    comment: '状态 (0:关闭,1:打开)',
    type: 'tinyint',
    default: 1,
  })
  status: number;

  @Column({ comment: '备注', length: 64, default: '' })
  remark: string;
}
