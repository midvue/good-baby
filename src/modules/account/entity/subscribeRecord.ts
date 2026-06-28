import { Column, Entity, Index } from 'typeorm';
import { SnowIdBaseEntity } from '../../base/base.entity';

/**
 * 订阅消息配额表（记录每个用户对各模板的可用下发次数）
 */
@Entity('app_subscribe_record', { comment: '订阅消息配额表' })
@Index('uk_user_template', ['userId', 'templateId'], { unique: true })
@Index('idx_template_available', ['templateId', 'availableCount'])
export class SubscribeRecord extends SnowIdBaseEntity {
  /** 用户 id（关联 app_account.id） */
  @Column({ name: 'user_id', comment: '用户id', length: 32 })
  userId: string;

  /** 微信 openid（冗余，下发时直接用，避免 JOIN app_account） */
  @Column({ name: 'openid', comment: '微信openid', length: 64 })
  openid: string;

  /** 订阅消息模板 id */
  @Column({ name: 'template_id', comment: '模板id', length: 64 })
  templateId: string;

  /** 可用下发次数（授权 +1，下发成功 -1） */
  @Column({
    name: 'available_count',
    comment: '可用下发次数',
    type: 'int',
    default: 0,
  })
  availableCount: number;

  /** 上次下发时间（喂养提醒防重复用） */
  @Column({
    name: 'last_send_time',
    comment: '上次下发时间',
    type: 'timestamp',
    precision: 3,
    default: null,
  })
  lastSendTime: Date;
}
