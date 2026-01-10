import { Column, Entity } from 'typeorm';
import { SnowIdBaseEntity } from '../../base/base.entity';

@Entity({
  comment: '胎动记录表',
  name: 'fetal_movement',
})
export class FetalMovement extends SnowIdBaseEntity {
  @Column({ comment: '用户ID' })
  userId: string;
  //胎动次数
  @Column({ comment: '胎动次数' })
  count: number;
  // 记录时间
  @Column({ comment: '记录时间', type: 'timestamp', name: 'record_time' })
  recordTime: string;
  //预产期
  @Column({ comment: '预产期', name: 'expect_date' })
  expectDate: string;
}
