# 模块结构

## 标准四层结构

每个业务模块必须有完整的四层，按职责划分：

```
src/modules/<module>/
├── controller/         # 路由层
│   └── xxx.controller.ts
├── service/            # 业务逻辑层
│   └── xxx.service.ts
├── entity/             # 数据库表定义
│   └── xxx.ts
└── dto/                # 入参类型与校验
    └── xxx.dto.ts
```

## entity / service / controller 对应关系（强制）

- **一个 entity 文件 → 必须对应一个 service + 一个 controller**
- 单表自动实现：分页查询、新增、更新、删除
- 例外：多对多中间表不需要单独 service/controller
- **同一业务域的多个 service 必须合并到同一模块**，不要按子功能拆模块

### 反例 vs 正例

```
❌ 错误：按子功能拆模块
modules/baby/service/feedReminder.service.ts
modules/baby/service/weeklyReport.service.ts

✅ 正确：合并为一个 service，放 entity 所在模块
modules/account/service/subscribeMessage.service.ts
```

## 现有模块清单

| 模块 | 职责 |
|------|------|
| `base` | 公共基类（BaseController/BaseService/BaseEntity/SnowIdBaseEntity） |
| `account` | 账号管理（app_account）、订阅配额（app_subscribe_record）、微信下发服务 |
| `baby` | 宝宝管理（baby）、喂养记录（feedRecord）、家庭关系（babyFamily/accountBabyFamily）、统计（feedRecordStatistics）、奶粉（milkPowder） |
| `points` | 积分系统（pointsRule/pointsRecord/pointsSummary） |
| `sys` | 系统管理（user/role/menu/btn） |
| `dict` | 字典管理 |
| `centre` | 孕期管理（胎动、宫缩、红包） |
| `ai` | AI 取名、姓名解释 |
| `upload` | 文件上传 |

## Processor（定时任务）

- 放 `src/processor/` 目录（独立于 modules）
- **Processor 只负责触发，业务逻辑必须在 service 层**
- 参考范式：`feedRecordStatistic.processor.ts`
