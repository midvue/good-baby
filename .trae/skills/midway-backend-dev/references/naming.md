# 命名规范

## 文件命名（强制）

所有文件用**驼峰命名**，禁止中划线。

| ❌ 错误 | ✅ 正确 |
|---------|---------|
| `wx-subscribe.service.ts` | `wxSubscribe.service.ts` |
| `feed-reminder.service.ts` | `feedReminder.service.ts` |
| `weekly-report.service.ts` | `weeklyReport.service.ts` |

### service 文件

格式：`xxx.service.ts`

```
account.service.ts          ✅
subscribe.service.ts        ✅
subscribeMessage.service.ts ✅
wxSubscribe.service.ts      ✅
```

### 其他文件

```
subscribe.dto.ts            ✅
subscribeRecord.ts          ✅（entity）
subscribe.controller.ts     ✅
```

## 常量/枚举命名

### 禁止缩写

| ❌ 错误 | ✅ 正确 |
|---------|---------|
| `SUBSCRIBE_TMPL_IDS` | `SUBSCRIBE_TEMPLATE_IDS` |
| `TMP_ID` | `TEMPLATE_ID` |

### 枚举规范

```ts
// 放 src/constants/dict.ts
export enum EnumFeedType {
  MILK_BOTTLE = 10,
  BREAST_FEED_DIRECT = 20,
}

export enum EnumWxSubscribeTemplate {
  FEED_REMINDER = 'XoM2-...',
  WEEKLY_REPORT = 'eqv7o...',
}
```

- 枚举值不要用魔法数字散落在代码里
- 统一放 `src/constants/dict.ts`
- 枚举名用 `Enum` 前缀
