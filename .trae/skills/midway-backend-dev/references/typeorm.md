# TypeORM 规范

## 单表操作禁止 createQueryBuilder（强制）

**单表 CRUD 必须使用 Repository 标准方法**：

| 操作 | ✅ 正确 | ❌ 错误 |
|------|---------|---------|
| 查询单条 | `findOne({ where, order })` | `createQueryBuilder().where().getOne()` |
| 查询列表 | `find({ where, take })` | `createQueryBuilder().where().getMany()` |
| 分页 | `findAndCount({ skip, take })` | `createQueryBuilder().limit().getRawMany()` |
| 条件更新 | `update({ where }, { fields })` | `createQueryBuilder().update().set().where()` |
| 条件删除 | `delete({ where })` | `createQueryBuilder().delete().where()` |
| 保存 | `save(entity)` | `createQueryBuilder().insert().values()` |
| 原子自增 | `increment({ where }, 'field', 1)` | `createQueryBuilder().update().set(() => 'field+1')` |
| 原子自减 | `decrement({ where }, 'field', 1)` | 手写 SQL |
| 批量 IN 查询 | `find({ where: { id: In([...]) } })` | `createQueryBuilder().whereInIds()` |

**只有跨表 JOIN、子查询、复杂聚合才允许 createQueryBuilder。**

## entity 继承规范

继承 `SnowIdBaseEntity`（雪花 ID），自带 `id` / `createTime` / `updateTime`：

```ts
import { Column, Entity, Index } from 'typeorm';
import { SnowIdBaseEntity } from '../../base/base.entity';

@Entity('app_account')
export class Account extends SnowIdBaseEntity {
  @Index('uk_open_id', { unique: true })
  @Column({ comment: '微信openid', length: 32, default: null })
  openid: string;

  @Column({ comment: '昵称', length: 32, default: null })
  nickname: string;

  @Column({ comment: '年龄', default: 0 })
  age: number;

  @Column({ length: 2, comment: '性别- 20:男性,10:女性', default: '' })
  gender: string;
}
```

### 基类说明

| 基类 | 主键 | 用途 |
|------|------|------|
| `SnowIdBaseEntity` | 雪花 ID（bigint，toString） | 默认选择，业务表都用这个 |
| `BaseEntity` | 无主键 | 需要自己加 `@PrimaryGeneratedColumn()` |

### 注意

- **不要用 `@PrimaryGeneratedColumn()`**（除非继承 BaseEntity），雪花 ID 由基类提供
- 索引：不要乱加，除非有明确的查询性能需求
- 非数据库字段（如关联查询出来的）：不加 `@Column`，声明为可选 `nickname?: string`

## 字段类型规范

| 场景 | 类型 | 示例 |
|------|------|------|
| 枚举/状态 | `varchar`，长度 2-8，值为 `'10'`/`'20'`/`'30'` | `gender: varchar(2)` |
| 业务 ID 关联 | `varchar(32)` | `baby_id`、`user_id` |
| 微信 openid | `varchar(32)` | app_account.openid |
| 普通字符串 | 指定 length（如 32/64/128） | `nickname: varchar(32)` |
| JSON 内容 | `type: 'json'` | `content: Record<string, any>` |
| 时间戳 | `type: 'timestamp'` | feedTime |
| 备注 | `varchar(128)`，`default: null` | remark |
| 数值 | `type: 'int'`/`'tinyint'` | volume、count |
| 布尔 | `type: 'tinyint'`，default 0/1 | status |

### 强制要求

- 所有 string 字段**必须指定 length**
- 字段必须有 `comment`
- 可空字段显式 `default: null`
- 表名不加前缀（`gb*`、`tb*`、`tb_` 等禁止）
