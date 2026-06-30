# DTO 校验规范

## 基本范式

```ts
import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';

export class XxxDTO {
  @Rule(RuleType.string().required())
  @ApiProperty({ example: '占位示例', description: '字段说明' })
  field: string;
}
```

## example 规范（强制）

**不要用真实数据当 example**：

| ❌ 错误 | ✅ 正确 |
|---------|---------|
| `example: 'XoM2-Px0cYR6Jp8Rps37ChU3E6fI74H_2JC8-ot57Oo'` | `example: 'feed_reminder_template_id'` |
| `example: '1928374650123456789'`（真实雪花 ID） | `example: 'example_user_id'` |
| `example: 'o7esq5PHRGBQYmeNyfG064wEFVpQ'`（真实 openid） | `example: 'example_openid'` |

用语义化占位符。

## 校验规则

基于 joi（`@midwayjs/validate`）：

```ts
// 必填字符串
@Rule(RuleType.string().required())

// 可空字符串
@Rule(RuleType.string().allow('').empty(''))

// 枚举值校验
@Rule(RuleType.string().valid('accept', 'reject').required())

// 数组对象
@Rule(RuleType.array().items(
  RuleType.object({
    templateId: RuleType.string().required(),
    status: RuleType.string().required(),
  })
).required())

// 数字默认值
@Rule(RuleType.number().required().default(20))
```

## 文件对应关系

- **一个 controller 文件对应一个 dto 文件**
- 放同一模块的 `dto/` 目录

## Controller 上使用

```ts
@Post('/create')
@Validate()  // 开启校验
@ApiOperation({ summary: '新增' })
async create(@Body() dto: XxxDTO) {
  // dto 已校验通过
}
```
