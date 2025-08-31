import { Column, Entity, Index } from 'typeorm';
import { SnowIdBaseEntity } from '../../base/base.entity';

/**
 * 宝宝喂养记录
 */
@Index('uk_complex_time_baby', ['feedDate', 'babyId'], {
  unique: true,
})
@Entity('baby_feed_record_statistics', { comment: '宝宝喂养记录统计' })
export class FeedRecordStatistics extends SnowIdBaseEntity {
  @Column({ name: 'baby_id', comment: '宝宝id' })
  babyId: string;

  @Column({ name: 'count', comment: '喂养总次数', type: 'int' })
  count: number;

  @Column({ name: 'details', comment: '喂养详情', type: 'json' })
  details: JSON;

  @Column({ name: 'feed_date', comment: '喂养日期', type: 'timestamp' })
  feedDate: string;
}
