import { Config, Inject, Provide, makeHttpRequest } from '@midwayjs/core';
import { RedisService } from '@midwayjs/redis';
import { BaseService } from '../../base/base.service';

/** 微信 access_token 响应 */
interface WxTokenResponse {
  access_token: string;
  expires_in: number;
  errcode?: number;
  errmsg?: string;
}

/** 微信 subscribeMessage.send 响应 */
interface WxSendResponse {
  errcode: number;
  errmsg: string;
  msgid?: string;
}

/** Redis key */
const REDIS_KEY_ACCESS_TOKEN = 'wx:access_token';

/**
 * 微信订阅消息下发服务
 * - access_token 缓存在 Redis，有效期 2 小时，多进程共享
 * - send 调用按 HTTP 同步返回 errcode 决定是否扣减配额
 */
@Provide()
export class WxSubscribeService extends BaseService {
  @Inject()
  redisService: RedisService;

  @Config('wx')
  wxConfig: { miniapp: { appid: string; secret: string } };

  /**
   * 获取 access_token（缓存命中直接复用，缓存失效重新获取）
   */
  async getAccessToken(): Promise<string> {
    const cached = await this.redisService.get(REDIS_KEY_ACCESS_TOKEN);
    if (cached) return cached;

    const { data } = await makeHttpRequest(
      'https://api.weixin.qq.com/cgi-bin/token',
      {
        data: {
          grant_type: 'client_credential',
          appid: this.wxConfig.miniapp.appid,
          secret: this.wxConfig.miniapp.secret,
        },
        dataType: 'json',
      }
    );
    const res = data as WxTokenResponse;
    if (!res.access_token) {
      throw new Error(
        `[wx] 获取 access_token 失败: errcode=${res.errcode}, errmsg=${res.errmsg}`
      );
    }
    // 提前 5 分钟刷新
    const ttl = Math.max(res.expires_in - 300, 60);
    await this.redisService.set(
      REDIS_KEY_ACCESS_TOKEN,
      res.access_token,
      'EX',
      ttl
    );
    return res.access_token;
  }

  /**
   * 下发订阅消息（HTTP 同步返回 errcode）
   * @param openid 用户 openid
   * @param templateId 模板 id
   * @param data 模板字段内容，key 为字段名（如 thing1），value 为 { value }
   * @param page 点击跳转的小程序页面路径（如 'pages/home/index'），不传则不跳转
   * @returns errcode === 0 表示成功
   */
  async send(
    openid: string,
    templateId: string,
    data: Record<string, { value: string }>,
    page?: string
  ): Promise<{
    success: boolean;
    errcode: number;
    errmsg: string;
    msgid?: string;
  }> {
    const accessToken = await this.getAccessToken();
    const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`;

    // 字段截断保护（thing 20字、phrase 5字等）
    const safeData = this.truncateFields(data);

    const body: Record<string, unknown> = {
      touser: openid,
      template_id: templateId,
      data: safeData,
    };
    if (page) body.page = page;

    const { data: respData } = await makeHttpRequest(url, {
      method: 'POST',
      data: body,
      dataType: 'json',
      contentType: 'json',
    });
    const res = respData as WxSendResponse;
    return {
      success: res.errcode === 0,
      errcode: res.errcode,
      errmsg: res.errmsg,
      msgid: res.msgid,
    };
  }

  /**
   * 字段截断：按微信字段类型限制截断，避免下发失败
   * - phrase：限 5 字
   * - character_string：限 32 字
   * - time/date：不截断
   * - 其他（thing 等）：限 20 字
   */
  private truncateFields(
    data: Record<string, { value: string }>
  ): Record<string, { value: string }> {
    const result: Record<string, { value: string }> = {};
    for (const [key, item] of Object.entries(data)) {
      const value = item.value || '';
      let limit = 20;
      if (key.startsWith('phrase')) limit = 5;
      else if (key.startsWith('character_string')) limit = 32;
      else if (key.startsWith('time') || key.startsWith('date'))
        limit = value.length;
      result[key] = { value: value.slice(0, limit) };
    }
    return result;
  }
}
