import { ILogger, ResOrMessage, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { CommHttpError } from '../../error/comm.error';
import { EnumRespCode } from '../../constants/errorCode';
import { isNumber } from '@mid-vue/shared';

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
  // 重载函数声明，支持传入一个 ResOrMessage 类型的参数

  protected commError(code: EnumRespCode | ResOrMessage, msg?: ResOrMessage) {
    if (!code) code = EnumRespCode.FAIL;
    // 如果code是字符串，说明只传入了msg，需要交换code和msg
    if (!isNumber(code)) {
      msg = code;
      code = EnumRespCode.FAIL;
    }
    throw new CommHttpError(code, msg);
  }
}
