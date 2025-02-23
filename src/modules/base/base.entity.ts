import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import * as dayjs from 'dayjs';

/**
 * entity基类
 */

const dateTransformer = {
  from: (value: Date | number) => {
    if (typeof value === 'object') {
      return dayjs(value.getTime()).format('YYYY-MM-DD HH:mm:ss');
    }
    return value;
  },
  to: () => new Date(),
};

export abstract class BaseEntity {
  @CreateDateColumn({
    name: 'create_time',
    type: 'timestamp',
    comment: '创建时间',
    default: () => 'CURRENT_TIMESTAMP(3)',
    precision: 3,
    transformer: dateTransformer,
  })
  createTime: Date;

  @UpdateDateColumn({
    name: 'update_time',
    type: 'timestamp',
    comment: '更新时间',
    default: () => 'CURRENT_TIMESTAMP(3)',
    onUpdate: 'CURRENT_TIMESTAMP(3)',
    precision: 3,
    transformer: dateTransformer,
  })
  updateTime: Date;
}
