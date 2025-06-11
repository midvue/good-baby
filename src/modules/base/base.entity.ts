import { Snowflake } from 'nodejs-snowflake';
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

/** 日期转换 */
export const dateTransformer = {
  from: (value: Date | number) => {
    if (typeof value === 'object') {
      return value.getTime();
    }
    return value;
  },
  to: () => new Date(),
};
/** 雪花ID */
const uid = new Snowflake({
  instance_id: 1,
  custom_epoch: 1734472500000,
});

/** 雪花ID转换 */
export const snowflakeTransformer = {
  from: (value: BigInt) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  },
  to: () => {
    return uid.getUniqueID(); // 返回一个新的唯一ID
  },
};

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
    transformer: dateTransformer,
  })
  createTime: number;

  @UpdateDateColumn({
    name: 'update_time',
    type: 'timestamp',
    comment: '更新时间',
    default: () => 'CURRENT_TIMESTAMP(3)',
    onUpdate: 'CURRENT_TIMESTAMP(3)',
    precision: 3,
    transformer: dateTransformer,
  })
  updateTime: number;
}
