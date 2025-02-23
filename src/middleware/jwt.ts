// src/middleware/jwt.middleware

import { Context, NextFunction } from '@midwayjs/koa';
import { httpError, Inject, Middleware } from '@midwayjs/core';
import { JwtService } from '@midwayjs/jwt';
import { Jwt, JwtPayload } from 'jsonwebtoken';

@Middleware()
export class JwtMiddleware {
  @Inject()
  jwtService: JwtService;

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      // 判断下有没有校验信息
      if (!ctx.headers['authorization']) {
        throw new httpError.UnauthorizedError();
      }
      // 从 header 上获取校验信息
      const parts = ctx.get('authorization').trim().split(' ');

      if (parts.length !== 2) {
        throw new httpError.UnauthorizedError();
      }

      const [scheme, token] = parts;

      if (/^Bearer$/i.test(scheme)) {
        try {
          //jwt.verify方法验证token是否有效
          const jwt = (await this.jwtService.verify(token, {
            complete: true,
          })) as Jwt;
          const payload = jwt.payload as JwtPayload;
          const { id, exp } = payload;
          const now = Math.floor(Date.now() / 1000);
          if (now - exp >= 0) {
            //过期处理
            throw new httpError.UnauthorizedError('登录状态已过期');
          }
          ctx.uid = id;
        } catch (error) {
          throw new httpError.UnauthorizedError('身份令牌无效');
        }
        await next();
      }
    };
  }
  whiteList = ['/', '/sys/auth/token'];
  // 配置忽略鉴权的路由地址
  public match(ctx: Context): boolean {
    const ignore = this.whiteList.includes(ctx.path);
    return !ignore;
  }

  public static getName(): string {
    return 'jwt';
  }
}
