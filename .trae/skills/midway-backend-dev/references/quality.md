# 代码质量红线

## 禁止项

### 1. 未使用的代码

```ts
// ❌ 未使用的变量
const startTime = now.subtract(intervalHour + 1, 'hour');  // 声明却不用

// ❌ 未使用的参数
function buildData(record: FeedRecord, babyNickname: string) {
  // babyNickname 从未引用
}

// ❌ 未使用的 import
import { LessThan } from 'typeorm';  // 没用到
```

**必须删除所有未使用的 import / 变量 / 参数。**

### 2. 空 catch / 空 .catch

```ts
// ❌ 空 try/catch（既不记录也不处理）
try {
  await foo();
} catch {
  // 静默
}

// ❌ 空 .catch
await api().catch(() => {});

// ✅ 有处理的 catch
try {
  await foo();
} catch (err) {
  logger.error('xxx 失败:', err.message);
}
```

**要么记录日志，要么删除 try/catch（让错误冒泡到调用方）。**

### 3. 没必要的中间变量

```ts
// ❌ 单次使用的变量
const volume = content.volume ? `${content.volume}ml` : '';
return { character_string3: { value: volume } };

// ✅ 直接内联
return {
  character_string3: { value: content.volume ? `${content.volume}ml` : '' },
};
```

### 4. 过度设计

```ts
// ❌ access_token 加 SETNX 锁 + 轮询 5 秒 + 超时兜底
// （微信 token 有效期 2 小时，不需要防竞争）

// ✅ 读缓存 → 没有就刷新 → 写回
```

### 5. 魔法数字

```ts
// ❌
if (content.type === 10) { ... }
const milkBottle = detailMap?.[10];

// ✅
if (content.type === EnumFeedType.MILK_BOTTLE) { ... }
const milkBottle = detailMap?.[EnumFeedType.MILK_BOTTLE];
```

### 6. 真实数据当 example

```ts
// ❌
@ApiProperty({ example: 'XoM2-Px0cYR6Jp8Rps37ChU3E6fI74H_2JC8-ot57Oo' })

// ✅
@ApiProperty({ example: 'feed_reminder_template_id' })
```

## 必做项

### 1. tsc 编译验证

```bash
npx tsc --noEmit
```

生成代码后**必须跑一遍**，0 错误才算完成。

### 2. 参考已有代码

生成代码前先读同类文件，匹配现有风格（命名、注释、结构）。

### 3. service 方法注释

```ts
/**
 * 累加配额（授权 accept 时调用）
 */
async addQuota(userId: string, templateId: string) { ... }
```

### 4. 精准修改

- 只碰必须碰的
- 不"改进"相邻代码、注释、格式
- 不重构没坏的东西
- 删除因自己改动产生的孤儿代码（import/变量）
- 不删除预先存在的死代码（除非被要求）

## 自检流程

```
1. 写完代码 → 跑 npx tsc --noEmit
2. 检查 import → 删未使用的
3. 检查变量/参数 → 删未使用的
4. 检查 catch → 删空的或加日志
5. 检查魔法数字 → 换成枚举
6. 检查命名 → 驼峰、完整单词
```
