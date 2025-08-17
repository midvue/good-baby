import { MidwayHttpError, Catch } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Catch()
export class DefaultErrorFilter {
  async catch(err: MidwayHttpError, ctx: Context) {
    // 所有的未分类错误会到这里
    const status = err.status ?? 500;
    ctx.status = status;
    ctx.logger.error(err);
    return {
      code: Number(err?.code || status),
      message: err.message,
    };
  }
}
