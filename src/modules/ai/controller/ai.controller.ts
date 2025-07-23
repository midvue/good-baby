import { Body, Controller, Inject, Post } from '@midwayjs/core';
import { ApiOperation } from '@midwayjs/swagger';
import { BaseController } from '../../base/base.controller';
import { AINameDTO } from '../dto/ai.dto';
import { AIService } from '../service/ai.service';

/**
 * AI 模块控制器
 */
@Controller('/ai', {
  description: 'AI模块',
  tagName: 'ai',
})
export class AIController extends BaseController {
  @Inject()
  aiService: AIService;

  @Post('/names')
  @ApiOperation({ summary: '调用火山引擎 AIP 接口' })
  async names(@Body() nameDto: AINameDTO) {
    const res = await this.aiService.names(nameDto);
    return this.success(res);
  }
}
