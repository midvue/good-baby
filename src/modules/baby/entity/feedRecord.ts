import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';

/**
 * 宝宝喂养记录
 */
@Entity('baby_feed_record', { comment: '宝宝喂养记录' })
export class FeedRecord extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '类型', type: 'tinyint' })
  type: number;

  @Column({ comment: '喂养内容', length: 32 })
  content: string;

  @Column({ name: 'feed_time', comment: '喂养日期', type: 'timestamp' })
  feedTime: number;
}
