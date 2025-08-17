import { Column, Index, PrimaryGeneratedColumn, Entity } from 'typeorm';

/**
 * 角色-菜单表
 */
@Entity('sys_role_menu')
@Index('uk_compx_id', ['roleId', 'menuId'], {
  unique: true,
})
export class RoleMenu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'role_id', comment: '角色id', nullable: false })
  roleId: number;

  @Column({ name: 'menu_id', comment: '菜单id', nullable: false })
  menuId: number;
}
