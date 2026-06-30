# Redis 使用规范

## 注入方式（按配置选择，强制）

项目 `config.default.ts` 中 Redis 配置决定注入方式。

### 单 client 配置（项目当前用这个）

```ts
// config.default.ts
redis: {
  client: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB, 10),
  },
}
```

**直接注入 `RedisService`**：

```ts
import { Inject } from '@midwayjs/core';
import { RedisService } from '@midwayjs/redis';

@Provide()
export class XxxService {
  @Inject()
  redisService: RedisService;

  async foo() {
    await this.redisService.set('key', 'value', 'EX', 3600);
    const val = await this.redisService.get('key');
  }
}
```

### 多 client 配置（项目暂未使用）

```ts
// config.default.ts
redis: {
  clients: {
    instance1: { ... },
    instance2: { ... },
  },
}
```

**用 Factory 或 InjectClient**：

```ts
// 方式1：Factory
@Inject()
redisServiceFactory: RedisServiceFactory;
const redis = this.redisServiceFactory.get('instance1');

// 方式2：InjectClient（推荐）
@InjectClient(RedisServiceFactory, 'instance1')
redis1: RedisService;
```

## 常见错误

| 错误 | 原因 | 修正 |
|------|------|------|
| `@InjectClient()` 不传参数 | 缺少 serviceFactoryClz | 传 `RedisServiceFactory` 或改用 `@Inject()` |
| 单 client 用 `Factory.get('default')` | 过度设计 | 直接 `@Inject() redisService: RedisService` |
| `RedisService` 从 `@midwayjs/core` 导入 | 导错包 | 从 `@midwayjs/redis` 导入 |
| access_token 加 SETNX 锁 + 轮询 | 过度设计 | 直接读缓存 → 没有就刷新 → 写回缓存 |

## access_token 缓存范式

```ts
async getAccessToken(): Promise<string> {
  // 1. 读缓存
  const cached = await this.redisService.get('wx:access_token');
  if (cached) return cached;

  // 2. 缓存没有，请求微信
  const res = await makeHttpRequest('https://api.weixin.qq.com/cgi-bin/token', {
    data: { grant_type: 'client_credential', appid, secret },
    dataType: 'json',
  });

  // 3. 写回缓存（提前 5 分钟刷新）
  const ttl = Math.max(res.expires_in - 300, 60);
  await this.redisService.set('wx:access_token', res.access_token, 'EX', ttl);
  return res.access_token;
}
```

**不需要分布式锁**：微信 access_token 有效期 2 小时，多进程偶发重复刷新返回同一 token，不影响业务。
