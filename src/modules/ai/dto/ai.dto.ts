import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';

/**
 * AI 请求参数 DTO
 */
export class AIRequestDTO {
  @Rule(RuleType.string().required())
  @ApiProperty({
    description: '请求内容',
    required: true,
    example: '请提供婴儿喂养建议',
  })
  content: string;
}
