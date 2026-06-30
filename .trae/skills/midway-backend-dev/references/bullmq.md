# BullMQ 定时任务规范

## 基本范式

```ts
import { Processor, IProcessor } from '@midwayjs/bullmq';
import { Inject } from '@midwayjs/core';
import { XxxService } from '../modules/xxx/service/xxx.service';

@Processor('taskName', {
  repeat: {
    pattern: '0 */10 * * * *',  // cron 表达式
  },
})
export class XxxProcessor implements IProcessor {
  @Inject()
  xxxService: XxxService;

  async execute() {
    // 只调 service，不写业务逻辑
    await this.xxxService.doWork();
  }
}
```

## 职责划分（强制）

| 层 | 职责 | 禁止 |
|----|------|------|
| Processor | 触发任务、传参 | ❌ 写业务逻辑、查数据库 |
| Service | 业务逻辑、数据库操作、异常容错 | ❌ 关心触发时机 |

## cron 表达式（6 位：秒 分 时 日 月 周）

```
┌──── 秒 (0-59)
│ ┌─── 分 (0-59)
│ │ ┌── 时 (0-23)
│ │ │ ┌─ 日 (1-31)
│ │ │ │ ┌ 月 (1-12)
│ │ │ │ │ ┌ 周 (0-6, 0=周日)
0 */10 * * * *    每 10 分钟
0 0 8 ? * MON     每周一 8:00
0 15 0 * * *      每天 00:15
```

也可用内置常量：

```ts
import { FORMAT } from '@midwayjs/core';

@Processor('xxx', {
  repeat: { pattern: FORMAT.CRONTAB.EVERY_DAY_ZERO_FIFTEEN },
})
```

## 异常容错（service 层）

```ts
async scanAndSend() {
  for (const item of list) {
    try {
      await this.processOne(item);
    } catch (err) {
      // 单个失败记日志，不中断整体
      this.logger.error(`[xxx] 处理失败 id=${item.id}:`, err.message);
    }
  }
}
```

## 参考文件

- [feedRecordStatistic.processor.ts](../../../../../good-baby-midway/src/processor/feedRecordStatistic.processor.ts) — 每日统计 + 周一分支
- [feedReminder.processor.ts](../../../../../good-baby-midway/src/processor/feedReminder.processor.ts) — 每 10 分钟扫描
