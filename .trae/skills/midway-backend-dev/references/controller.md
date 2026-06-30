# Controller 规范

## 基本范式

```ts
import { Body, Controller, Get, Inject, Post } from '@midwayjs/core';
import { ApiOperation } from '@midwayjs/swagger';
import { Validate } from '@midwayjs/validate';
import { BaseController } from '../../base/base.controller';
import { XxxDTO } from '../dto/xxx.dto';
import { XxxService } from '../service/xxx.service';

@Controller('/subscribe', {
  description: '订阅消息',
  tagName: 'subscribe',
})
export class XxxController extends BaseController {
  @Inject()
  xxxService: XxxService;

  @Post('/create')
  @Validate()
  @ApiOperation({ summary: '新增' })
  async create(@Body() dto: XxxDTO) {
    const res = await this.xxxService.create(dto);
    return this.success(res);
  }
}
```

## 关键规则

| 规则 | 说明 |
|------|------|
| 继承 `BaseController` | 提供 `this.success()` 和 `this.commError()` |
| 不需要 `@Provide()` | `@Controller` 已隐含 |
| 复杂查询用 POST | 参数是复杂类型的查询，用 POST 代替 GET |
| 一个 controller 一个 dto | 文件一一对应 |
| `@Validate()` | 写在需要校验的方法上 |
| `@ApiOperation` | 每个路由都要有 summary |

## 返回值规范

```ts
// 成功（继承 BaseController 自带）
return this.success(data);          // { code: 0, message: 'success', data }

// 业务错误
return this.commError('错误信息');   // 抛出 CommHttpError
return this.commError(code, 'msg'); // 自定义 code
```

## 从 JWT 拿用户信息

```ts
@Post('/report')
async report(@Body() dto: XxxDTO) {
  const userId = this.ctx.uid;  // JWT 中间件注入
  // ...
}
```
