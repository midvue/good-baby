import { Column, Index, PrimaryGeneratedColumn, Entity } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';

/**
 * 菜单表
 */
@Entity('sys_menu')
@Index('uk_compx_code', ['pid', 'code'], {
  unique: true,
})
export class Menu extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '菜单编码', length: 48 })
  code: string;

  @Column({ comment: '菜单名称', length: 64, default: '' })
  name: string;

  @Column({
    comment: '父菜单ID',
    default: 0,
  })
  pid: number;

  @Column({ comment: '菜单地址', length: 255, default: '' })
  url: string;

  @Column({
    comment: '类型(1：菜单 2：按钮)',
    default: 0,
    type: 'tinyint',
  })
  type: number;

  @Column({ comment: '图标', length: 255, default: '' })
  icon: string;

  @Column({ name: 'order_num', comment: '排序', default: 0 })
  orderNum: number;

  @Column({ name: 'keep_alive', comment: '是否缓存', default: false })
  keepAlive: boolean;

  @Column({ name: 'is_show', comment: '是否显示', default: true })
  isShow: boolean;

  @Column({ length: 64, comment: '备注', default: '' })
  remark: string;

  // 父菜单名称
  parentName?: string;
}
