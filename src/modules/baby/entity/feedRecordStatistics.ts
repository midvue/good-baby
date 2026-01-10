import { Column, Entity, Index } from 'typeorm';
import { SnowIdBaseEntity } from '../../base/base.entity';
import { EnumFeedType } from '../../../constants/dict';

// 定义通用的统计信息类型
export interface FeedStatBase {
  count: number;
  lastFeedTime: string;
  lastFeedUid: string;
  total?: number;
  duration?: number;
  feedType: EnumFeedType;
  userStatList: Omit<FeedStatBase, 'userStatList' | 'singleMaxTotal'>[];
  singleMaxTotal?: number;
}

/**
 * 宝宝喂养记录
 */
@Index('uk_complex_time_baby', ['feedDate', 'babyId'], {
  unique: true,
})
@Entity('baby_feed_record_statistics', { comment: '宝宝喂养记录统计' })
export class FeedRecordStatistics extends SnowIdBaseEntity {
  @Column({ name: 'baby_id', comment: '宝宝id', length: 32 })
  babyId: string;

  @Column({ name: 'count', comment: '喂养总次数', type: 'int' })
  count: number;

  @Column({
    name: 'feed_date',
    comment: '喂养日期',
    type: 'timestamp',
  })
  feedDate: string;

  @Column({ name: 'milk_bottle', comment: '奶瓶喂养详情', type: 'json' })
  milkBottle: FeedStatBase;

  @Column({
    name: 'breast_feed_direct',
    comment: '母乳喂养详情',
    type: 'json',
  })
  breastFeedDirect: FeedStatBase;

  @Column({
    name: 'diaper',
    comment: '换尿布汇总',
    type: 'json',
  })
  diaper: FeedStatBase;

  @Column({
    name: 'height_weight',
    comment: '生产发育',
    type: 'json',
  })
  heightWeight: FeedStatBase;

  @Column({
    name: 'other_feed_List',
    comment: '其他喂养类型',
    type: 'json',
  })
  otherFeedList: FeedStatBase[];
}
