import { Config, Provide } from '@midwayjs/core';
import OpenAI from 'openai';
import { BaseService } from '../../base/base.service';
import { AINameDTO } from '../dto/ai.dto';
import { EnumYesNoPlus } from '@mid-vue/shared';

/**
 * AI 模块服务
 */
@Provide()
export class AIService extends BaseService {
  @Config('ai')
  ai: { volcengine: { apiKey: string; baseURL: string } };

  /**
   * 调用ai模型取名
   */
  async names(dto: AINameDTO) {
    const openai = new OpenAI({
      apiKey: this.ai.volcengine.apiKey,
      baseURL: this.ai.volcengine.baseURL,
    });
    const content = `
          我需要给宝宝取一个名字
          性别:${dto.gender === EnumYesNoPlus.NO ? '男' : '女'}
          ${
            dto.birthDate
              ? '出生日期:' + dto.birthDate + ' ' + dto.birthTime + ','
              : ''
          }
          ${dto.remark ? '备注:' + dto.remark : ''}
          1. 参考诗经,论语,礼记,楚辞,周易,唐诗,宋词等经典文本里面取字组合,生成30个名字,并返回对应的寓意典故
          2. 另外从现在流行的字中组合名字,生成20个名字,并返回名字的寓意,
          3. 一共返回50个名字(name),同时还返回对应的寓意典故(desc)长度在30个汉字以内
          4. 返回的结果结构为:
          [
            [{name:'',desc:''}],
            [{name:'',desc:''}],
            [{name:'',desc:''}]
          ] 
          5. 结果直接返回[开头,结尾]的JSON代码,不要有任何其他无关的内容,也不要有任何其他的注释,说明
        `;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: '你是一个专业的中文汉字专家,专业取名助手',
        },
        {
          role: 'user',
          content,
        },
      ],
      model: 'deepseek-v3-250324',
      //model: 'kimi-k2-250711',
    });
    return JSON.parse(completion.choices[0].message.content);
  }
}
