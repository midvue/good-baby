import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * entity基类
 */

export abstract class BaseEntity {
  @CreateDateColumn({
    name: 'create_time',
    type: 'timestamp',
    comment: '创建时间',
    default: () => 'CURRENT_TIMESTAMP(3)',
    precision: 3,
  })
  createTime: number;

  @UpdateDateColumn({
    name: 'update_time',
    type: 'timestamp',
    comment: '更新时间',
    default: () => 'CURRENT_TIMESTAMP(3)',
    onUpdate: 'CURRENT_TIMESTAMP(3)',
    precision: 3,
  })
  updateTime: number;
}
