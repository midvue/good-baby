import { Column, Entity, Index } from 'typeorm';
import { SnowIdBaseEntity } from '../../base/base.entity';

/**
 * 姓名表
 */
@Index('uk_name', ['userId', 'name'], {
  unique: true,
})
@Entity('name_records', { comment: '姓名使用-记录表' })
export class NameRecords extends SnowIdBaseEntity {
  @Column({ comment: '名称', length: 16 })
  name: string;

  @Column({ comment: '用户id', length: 32 })
  userId: string;

  @Column({ comment: '性别(10:女,20:男)', length: 8 })
  gender: string;
}
