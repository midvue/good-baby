import { Column, Index, PrimaryGeneratedColumn, Entity } from 'typeorm';

/**
 * 用户-角色表
 */
@Entity('sys_user_role')
@Index('uk_compx_id', ['userId', 'roleId'], {
  unique: true,
})
export class UserRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', comment: '用户id', nullable: false })
  userId: number;

  @Column({ name: 'role_id', comment: '菜单id', nullable: false })
  roleId: number;
}
