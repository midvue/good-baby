import { ILogger, ResOrMessage, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { CommHttpError } from '../../error/comm.error';

export abstract class BaseController {
  @Inject()
  protected ctx: Context;

  @Inject()
  protected logger: ILogger;

  /**
   * 请求成功返回
   * @param data 响应对象
   * @param message 响应msg
   * @param code  响应自定义状态码
   */
  protected success(data = null, code = 0, message = 'success') {
    this.ctx.status = 200;
    this.ctx.body = {
      code: code,
      message,
      data,
    };
  }

  /**
   * 抛出常规错误,status固定为200 , code自定义
   * @param {number} code 自定义code
   * @param {ResOrMessage} msg 内容
   */
  protected commError(code: number, msg?: ResOrMessage) {
    throw new CommHttpError(code, msg);
  }
}
