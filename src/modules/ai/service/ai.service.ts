import { Config, Inject, Provide } from '@midwayjs/core';
import OpenAI from 'openai';
import { BaseService } from '../../base/base.service';
import { AiInterpretDTO, AINameDTO } from '../dto/ai.dto';
import { EnumYesNoPlus } from '@mid-vue/shared';
import { NameService } from './name.service';
import { count } from 'console';
import { Name } from '../entity/name';

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
    //先从names表姓名
    const names = await this.nameService.pageList(dto);
    if (names.length > 0) {
      return names;
    }
    // names表里面没有的话,调用ai模型取名
    const allNames = await this.nameService.listAll(dto);
    const openai = new OpenAI({
      apiKey: this.ai.volcengine.apiKey,
      baseURL: this.ai.volcengine.baseURL,
    });
    const content = `
          我需要给宝宝取一个名字
          性别:${dto.gender === EnumYesNoPlus.NO ? '男' : '女'}
          1. 参考诗经,论语,礼记,楚辞,周易,唐诗,宋词等经典文本里面取字组合,生成30个名字
          2. 另外从现在流行的字中组合名字,生成20个名字
          3. 一共返回50个不重复名字(name),2-4个字符
          ${
            names.length <= 0 && allNames.length > 0
              ? '4.不要包含这些姓名:' +
                allNames.map(item => item.name).join(',')
              : ''
          }
          5. 返回的结果结构为[string]的JSON代码,名字之间用逗号隔开,一定要是正常的json,不能有任何其他的标点,符合,以及注释
           
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
    const aiNames = JSON.parse(completion.choices[0].message.content);
    if (!Array.isArray(aiNames)) {
      throw new Error('返回结果不是数组');
    }
    //names去重
    const list = [...new Set(aiNames)].map(name => {
      return {
        name: name.slice(0, 6),
        gender: dto.gender,
        userId: dto.userId,
      };
    });

    // 新增姓名
    await this.nameService.add(list);

    return list;
  }
  /**
   * 调用ai模型解释姓名
   */
  async interpretNames(dto: AiInterpretDTO) {
    // 从name表查询姓名解释
    const names = await this.nameService.list(dto.names);
    // 过滤出没有解释的姓名
    const namesWithoutDesc = names.filter(name => !name.desc?.desc);

    // 如果所有姓名都有解释,则直接返回
    if (namesWithoutDesc.length === 0) {
      return names.map(({ name, desc }) => ({
        name,
        spell: desc.spell,
        desc: desc.desc,
        origin: desc.origin,
      }));
    }
    const openai = new OpenAI({
      apiKey: this.ai.volcengine.apiKey,
      baseURL: this.ai.volcengine.baseURL,
    });
    const content = `
          我需要分别解释以下宝宝的姓名
          姓名:${namesWithoutDesc.map(item => item.name).join(',')}
          1. 先解释每个字的读音和含义
          2. 再解释姓名的整体含义,来源和出处
          3. 简单概括寓意和象征意义
          4. 返回的结果结构为[{name:'姓名',spell:'读音', origin:'来源', desc:'解释'}]的JSON代码,一定要是正常的json,不能有任何其他的注释,说明
        `;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: '你是一个专业的中文汉字专家,专业解释姓名助手',
        },
        {
          role: 'user',
          content,
        },
      ],
      model: 'kimi-k2-250905',
    });
    const aiArr = JSON.parse(completion.choices[0].message.content) as ({
      name: string;
    } & Name['desc'])[];
    if (!Array.isArray(aiArr)) {
      throw new Error('返回结果不是数组');
    }
    // 把解释的json插入到name表的desc字段,下次查询时直接从desc字段获取解释
    await this.nameService.updateInterpretNames(aiArr, dto);

    // 把aiArr与names已经解释的姓名合并
    const res = names.map(name => {
      const ai = aiArr.find(item => item.name === name.name);
      if (!ai) {
        return {
          name: name.name,
          ...name.desc,
        };
      }
      return {
        name: name.name,
        spell: ai.spell || '',
        desc: ai.desc || '',
        origin: ai.origin || '',
      };
    });

    return res;
  }
}
