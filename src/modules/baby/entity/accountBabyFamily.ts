import { Column, Index, PrimaryGeneratedColumn, Entity } from 'typeorm';

/**
 * 用户-家庭-关系表
 */
@Entity('account_baby_family', { comment: '用户-家庭-关系表' })
@Index('uk_complex_id', ['userId', 'familyId', 'role'], {
  unique: true,
})
export class AccountBabyFamily {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', comment: '用户id', nullable: false, length: 32 })
  userId: string;

  @Column({ name: 'family_id', comment: '家庭id', nullable: false, length: 32 })
  familyId: string;

  @Column({
    length: 2,
    name: 'role',
    comment: '角色身份(10:创建者,20:受邀者)',
    nullable: false,
  })
  role: string;

  @Column({
    length: 8,
    name: 'relation',
    comment: '关系身份(200:爸爸,100:妈妈) 字典:FAMILY_RELATION',
    nullable: false,
  })
  relation: string;
}
