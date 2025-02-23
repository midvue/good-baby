import { ILogger, ResOrMessage, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { CommHttpError } from '../../error/comm.error';

export abstract class BaseService {
  @Inject()
  protected ctx: Context;

  @Inject()
  logger: ILogger;

  /**
   * 抛出常规错误,status固定为200 , code自定义
   * @param {number} code 自定义code
   * @param {ResOrMessage} msg 内容
   */
  protected commError(code: number, msg?: ResOrMessage) {
    throw new CommHttpError(code, msg);
  }
}
