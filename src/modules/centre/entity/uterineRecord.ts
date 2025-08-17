import { Column, Entity } from 'typeorm';
import { SnowIdBaseEntity } from '../../base/base.entity';

@Entity()
export class UterineRecord extends SnowIdBaseEntity {
  @Column({ comment: '用户ID' })
  userId: string;

  @Column({ comment: '开始时间', type: 'timestamp' })
  startTime: string;

  @Column({ comment: '结束时间', type: 'timestamp' })
  endTime: string;

  @Column({ comment: '持续时间（秒）' })
  duration: number;

  @Column({ comment: '间隔时间（秒）' })
  interval: number;
}
