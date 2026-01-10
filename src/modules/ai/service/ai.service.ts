import { Config, Inject, Provide } from '@midwayjs/core';
import OpenAI from 'openai';
import { BaseService } from '../../base/base.service';
import { AINameDTO } from '../dto/ai.dto';
import { EnumYesNoPlus } from '@mid-vue/shared';
import { NameService } from './name.service';
import { count } from 'console';

/**
 * AI 模块服务
 */
@Provide()
export class AIService extends BaseService {
  @Config('ai')
  ai: { volcengine: { apiKey: string; baseURL: string } };

  @Inject()
  nameService: NameService;

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
          1. 参考诗经,论语,礼记,楚辞,周易,唐诗,宋词等经典文本里面取字组合,生成30个名字
          2. 另外从现在流行的字中组合名字,生成20个名字
          3. 一共返回50个不重复名字(name),2-4个字符
          4. 返回的结果结构为[string]的JSON代码,名字之间用逗号隔开,一定要是正常的json,不能有任何其他的注释,说明
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
      // model: 'deepseek-v3-250324',
      model: 'kimi-k2-250905',
    });
    const names = JSON.parse(completion.choices[0].message.content);
    if (!Array.isArray(names)) {
      throw new Error('返回结果不是数组');
    }
    console.log(names);
    //names去重
    const list = [...new Set(names)].map(name => {
      return {
        name,
        gender: dto.gender,
        userId: dto.userId,
        desc: '',
      };
    });

    // 新增姓名
    await this.nameService.add(list);

    console.log(list);
    return list;
  }
}
