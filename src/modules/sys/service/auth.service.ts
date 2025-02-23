import { Inject, Provide, httpError } from '@midwayjs/core';
import { JwtService } from '@midwayjs/jwt';
import { BaseService } from '../../base/base.service';
import { UserService } from '../service/user.service';
import { UserCreateDTO } from '../dto/user.dto';
@Provide()
export class AuthService extends BaseService {
  @Inject()
  jwtService: JwtService;

  @Inject()
  userService: UserService;

  /**
   * 登录
   */
  async login(options: UserCreateDTO) {
    const { password, account } = options;
    const {
      id,
      status,
      password: dbPwd,
    } = await this.userService.getUserByAccount(account);

    if (!id) {
      throw new httpError.ForbiddenError('您的账号不存在');
    }

    if (status === 0) {
      throw new httpError.ForbiddenError('当前用户已经被禁用');
    }

    if (dbPwd !== password) {
      throw new httpError.ForbiddenError('您的密码错误');
    }
    const token = await this.jwtService.sign({ id });
    return { token };
  }

  /**
   * 退出登录
   */
  async logout(uid: number) {
    //清除登录连接 缓存
    //清除redis
    //清除soketio连接
    return { uid };
  }

  /**
   * 获取短信验证码
   */
  async smsCode() {}

  /**
   * 校验token
   */
  async jwtVerify() {
    return {};
  }
}
