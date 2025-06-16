import { Column, Entity, Index } from 'typeorm';
import { SnowIdBaseEntity } from '../../base/base.entity';

/**
 * 宝宝喂养记录
 */
@Entity('baby_feed_record', { comment: '宝宝喂养记录' })
@Index('uk_complex_time_baby', ['feedTime', 'babyId', 'feedType'])
export class FeedRecord extends SnowIdBaseEntity {
  @Column({ name: 'baby_id', comment: '宝宝id' })
  babyId: string;

  @Column({ name: 'create_id', comment: '创建人id' })
  createId: string;

  @Column({ name: 'feed_type', comment: '喂养类型', type: 'tinyint' })
  feedType: number;

  @Column({ name: 'feed_time', comment: '喂养日期', type: 'timestamp' })
  feedTime: string;

  @Column({ comment: '喂养内容', type: 'json' })
  content: JSON;

  @Column({ name: 'remark', comment: '备注', length: 128, default: null })
  remark: string;
}
