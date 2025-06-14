import { Snowflake } from 'nodejs-snowflake';
import {
  BeforeInsert,
  CreateDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

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
const snowFlake = new Snowflake({
  instance_id: 1, // 实例ID，取值范围 0-31，默认为 0
  custom_epoch: 1734472500000, // 其实时间戳，默认为 （2023-01-27 12:00:00）
});

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

/**
 * 雪花id的基类
 */
export abstract class SnowIdBaseEntity extends BaseEntity {
  @PrimaryColumn({
    type: 'bigint',
    transformer: {
      from: value => value.toString(),
      to: value => value,
    },
  })
  id: string;

  @BeforeInsert()
  async beforeInsert() {
    this.id = snowFlake.getUniqueID().toString();
  }
}
