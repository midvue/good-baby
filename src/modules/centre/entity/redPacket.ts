import { Column, Entity } from 'typeorm';
import { SnowIdBaseEntity } from '../../base/base.entity';

@Entity()
export class RedPacket extends SnowIdBaseEntity {
  @Column({ comment: '用户ID' })
  userId: string;
  @Column({ comment: '宝宝ID' })
  babyId: string;

  @Column({ comment: '记录时间', type: 'timestamp' })
  recordTime: string;

  @Column({ comment: '金额' })
  amount: number;

  @Column({ comment: '姓名' })
  name: string;

  @Column({ comment: '称呼' })
  callName: string;

  @Column({ comment: '红包类型' })
  type: number;
}
