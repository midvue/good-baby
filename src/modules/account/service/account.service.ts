import { Config, Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../base/base.service';
import {
  AccountCreateDTO,
  AccountPageDTO,
  AccountUpdateDTO,
  AccountWxDTO,
} from '../dto/account.dto';
import { Account } from '../entity/account';
import { makeHttpRequest } from '@midwayjs/core';
import { JwtService } from '@midwayjs/jwt';
import { AccountBabyFamily } from '../../baby/entity/accountBabyFamily';

interface Code2sessionData {
  openid: string;
  errcode?: number;
  errmsg?: string;
}
@Provide()
export class AccountService extends BaseService {
  @InjectEntityModel(Account)
  accountModel: Repository<Account>;
  @InjectEntityModel(AccountBabyFamily)
  accountBabyFamilyModel: Repository<AccountBabyFamily>;
  @Inject()
  jwtService: JwtService;

  @Config('wx')
  wxConfig: { miniapp: { appid: string; secret: string } };
  /** 微信获取openid */
  async xwLogin(dto: AccountWxDTO) {
    const { data } = await makeHttpRequest(
      'https://api.weixin.qq.com/sns/jscode2session',
      {
        data: {
          js_code: dto.code,
          grant_type: 'authorization_code',
          appid: this.wxConfig.miniapp.appid,
          secret: this.wxConfig.miniapp.secret,
        },
        dataType: 'json',
      }
    );
    let session = data as Code2sessionData;
    if (!session.openid) {
      return this.commError(session.errcode, session.errmsg);
    }

    let info = await this.accountModel.findOne({
      where: { openid: session.openid },
    });
    if (!info) {
      info = await this.accountModel.save(
        Object.assign(new Account(), { openid: session.openid })
      );
    }
    const token = await this.jwtService.sign({ id: info.id });
    return { token };
  }

  async page(options: Partial<AccountPageDTO>) {
    const { id } = options;

    const where = {
      id,
    };

    const [list, count] = await this.accountModel.findAndCount({
      where,
      order: {
        id: 'DESC',
        createTime: 'DESC',
      },
      skip: (options.current - 1) * options.size,
      take: options.size,
    });

    return { list, count };
  }
  async info(id: string) {
    const res = await Promise.all([
      this.accountModel.findOne({
        select: [
          'age',
          'id',
          'updateTime',
          'phone',
          'gender',
          'nickname',
          'createTime',
        ],
        where: { id },
      }),
      this.accountBabyFamilyModel.findOne({
        select: ['familyId'],
        where: { userId: id, role: '10' },
      }),
    ]);
    return { ...res[0], familyId: res[1]?.familyId };
  }

  async create(inDto: AccountCreateDTO) {
    const { id } = await this.accountModel.save(
      Object.assign(new Account(), inDto)
    );
    return { id };
  }

  async update(upDto: AccountUpdateDTO) {
    return await this.accountModel.update(upDto.id, upDto);
  }

  async delete(id: string) {
    return await this.accountModel.delete(id);
  }
}
