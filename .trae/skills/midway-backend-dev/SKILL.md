---
name: midway-backend-dev
description: MidwayJS 后端开发规范。在 good-baby-midway 项目中编写/修改 controller/service/entity/dto、使用 TypeORM/Redis/BullMQ、或涉及模块划分时必须调用。
author: good-baby
category: backend
---

# MidwayJS 后端开发规范

适用于 `good-baby-midway` 项目（Midway.js 4.x + TypeORM + MySQL + Redis + BullMQ）。

## 核心原则

- **参考已有代码**：生成代码前先读同类文件，匹配现有风格
- **简洁优先**：不要过度设计、不要未要求的抽象、不要为不可能场景做错误处理
- **精准修改**：只碰必须碰的，不"改进"相邻代码，不重构没坏的东西

## 规范索引

| 主题 | 说明 | 详细文档 |
|------|------|---------|
| 模块结构 | controller/service/entity/dto 四层 + Processor 触发 | [module.md](./references/module.md) |
| TypeORM | 单表禁止 createQueryBuilder、entity 继承、字段类型 | [typeorm.md](./references/typeorm.md) |
| Redis | 单 client 直接注入 RedisService、常见错误 | [redis.md](./references/redis.md) |
| DTO 校验 | @midwayjs/validate + swagger、example 规范 | [dto.md](./references/dto.md) |
| Controller | 路由注解、继承 BaseController、POST 代替复杂 GET | [controller.md](./references/controller.md) |
| BullMQ 定时任务 | Processor 只触发、业务在 service、cron 表达式 | [bullmq.md](./references/bullmq.md) |
| 工具库 | @mid-vue/shared 的 useDate/dateFormat/durationFormatNoZero 等 | [shared.md](./references/shared.md) |
| 命名规范 | 文件驼峰、枚举完整单词、禁止中划线 | [naming.md](./references/naming.md) |
| 代码质量 | 禁止项、必做项、空 catch、未使用变量 | [quality.md](./references/quality.md) |

## 自检清单（生成代码后必须跑一遍）

```
□ npx tsc --noEmit 编译通过
□ 无未使用的 import / 变量 / 参数
□ 无魔法数字（必须用枚举，枚举放 src/constants/dict.ts）
□ 无空 catch {} / .catch(() => {})
□ 文件命名驼峰（禁止中划线 wx-subscribe.service.ts）
□ service 放在 entity 所在模块（不跨模块拆 service）
□ 单表操作未用 createQueryBuilder（用 find/findOne/update/save/increment）
□ Redis 注入方式与配置匹配（单 client 用 @Inject() redisService: RedisService）
□ @ApiProperty 的 example 不用真实数据（真实 ID/openid/密钥）
□ 日期处理用 @mid-vue/shared（不手算小时/分钟）
□ Processor 只触发，业务逻辑全在 service
□ 字段名/表名/索引符合规范（varchar 指定 length、枚举 varchar、字段有 comment）
```

## 关键技术栈版本

- Midway.js 4.1.0
- TypeORM 0.3.20
- MySQL 8.x
- Redis（ioredis）
- BullMQ（@midwayjs/bullmq）
- @mid-vue/shared（日期/类型/lodash 等工具）
