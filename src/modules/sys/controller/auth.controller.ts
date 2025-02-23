import { Body, Controller, Inject, Post } from '@midwayjs/core';
import { ApiOperation } from '@midwayjs/swagger';
import { Validate } from '@midwayjs/validate';
import { BaseController } from '../../base/base.controller';
import { UserCreateDTO } from '../dto/user.dto';
import { AuthService } from '../service/auth.service';

@Controller('/sys/auth', { description: '鉴权管理', tagName: 'auth' })
export class AuthController extends BaseController {
  @Inject()
  authService: AuthService;

  @Post('/token')
  @Validate()
  @ApiOperation({ summary: '获取token登录' })
  async login(@Body() userDto: UserCreateDTO) {
    const res = await this.authService.login(userDto);
    return this.success(res);
  }

  @Post('/logout')
  @ApiOperation({ summary: '退出登录' })
  async logout() {
    const uid = this.ctx.uid;
    const res = await this.authService.logout(uid);
    return res;
  }

  @Post('/smsCode')
  @Validate()
  @ApiOperation({ summary: '获取短信验证码' })
  async smsCode() {}
}
