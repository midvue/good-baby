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
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            '你是一个专业的中文国学大师,精通四书五经,精通各种古诗词典故,熟悉新华字典寓意字,生僻字',
        },
        {
          role: 'user',
          content: `
          我需要给宝宝取一个名字
          姓氏:${dto.surname},
          性别:${dto.gender === EnumYesNoPlus.NO ? '男' : '女'},
          ${
            dto.birthDate
              ? '出生日期:' + dto.birthDate + ' ' + dto.birthTime
              : ''
          },
          ${dto.remark ? '备注:' + dto.remark : ''}
          1. 从清新婉约,英武阳刚,励志成才,平安健康,节气四季,蔬果绿植,现代流行等7个角度,每个角度取2个2字名字,3个3个字名字,一共7*5=35个名字
          2. 书写简单,重复少,寓意深刻,有典故,有出处的名字算好的名字
          3. 返回的名字(name),同时还返回对应的寓意典故(desc)长度在30个汉字以内
          4. 返回的结果结构为:
          [
            [{name:'',desc:''}],
            [{name:'',desc:''}],
            [{name:'',desc:''}],
            [{name:'',desc:''}],
            [{name:'',desc:''}],
            [{name:'',desc:''}],
            [{name:'',desc:''}]
          ] 
          5. 结果直接返回[开头,结尾]的JSON代码,不要有任何其他无关的内容,也不要有任何其他的注释,说明
        `,
        },
      ],
      model: 'deepseek-v3-250324',
    });
    return JSON.parse(completion.choices[0].message.content);
  }
}
