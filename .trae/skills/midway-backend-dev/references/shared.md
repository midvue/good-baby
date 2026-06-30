# 工具库（@mid-vue/shared）

日期/类型/lodash 等常用库统一用 `@mid-vue/shared`，不手写。

## 日期处理

```ts
import { useDate, dateFormat, durationFormatNoZero, dateDiff } from '@mid-vue/shared';

// 当前时间 dayjs 实例
const now = useDate();
now.format('YYYY-MM-DD HH:mm:ss');

// 格式化日期
dateFormat(time, 'YYYY-MM-DD HH:mm');

// 计算时长（返回毫秒，再格式化）
const duration = useDate().diff(useDate(record.feedTime));
const text = durationFormatNoZero(duration, { format: 'H小时m分钟' });
// 结果：'3小时20分钟' 或 '刚刚'（为空时）

// 相对时间
dateDiff(now, record.feedTime);
```

## 反例 vs 正例

```ts
// ❌ 错误：手算小时（丢分钟）
const hours = useDate().diff(useDate(record.feedTime), 'hour');
// 2 小时 59 分钟 → 显示 '2 小时'

// ✅ 正确：用 durationFormatNoZero
const duration = useDate().diff(useDate(record.feedTime));
const text = (durationFormatNoZero(duration, { format: 'H小时m分钟' }) as string) || '刚刚';
```

## 常用函数速查

| 函数 | 用途 | 示例 |
|------|------|------|
| `useDate(date?)` | 获取 dayjs 实例 | `useDate().format('YYYY-MM-DD')` |
| `dateFormat(date, fmt)` | 格式化日期 | `dateFormat(time, 'YYYY-MM-DD HH:mm')` |
| `durationFormatNoZero(ms, {format})` | 格式化时长（去零） | `durationFormatNoZero(ms, {format:'H小时m分钟'})` |
| `dateDiff(now, before)` | 时间差（毫秒） | `dateDiff(Date.now(), feedTime)` |
| `minute(time)` | 当前时间到分钟 | `minute(Date.now())` |
| `dateFromNow(time)` | 相对时间显示 | `dateFromNow('2024-03-02')` |

## 注意事项

- `useDate().diff()` 默认返回**毫秒**
- `durationFormatNoZero` 入参也是毫秒（`unit: 'ms'` 默认）
- 返回值类型是 `Array<string> | string`，需要 `as string`
- 为空（duration=0）时返回空字符串，需要兜底 `|| '刚刚'`
