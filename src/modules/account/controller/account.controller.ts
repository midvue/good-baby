import {
  Body,
  Controller,
  Del,
  Get,
  Inject,
  Post,
  Put,
  Query,
} from '@midwayjs/core';
import { ApiOperation } from '@midwayjs/swagger';
import { Validate } from '@midwayjs/validate';
import { BaseController } from '../../base/base.controller';
import {
  AccountCreateDTO,
  AccountPageDTO,
  AccountUpdateDTO,
  AccountWxDTO,
} from '../dto/account.dto';
import { AccountService } from '../service/account.service';

@Controller('/app/account', {
  description: '用户端-账号管理',
  tagName: 'account',
})
export class AccountController extends BaseController {
  @Inject()
  accountService: AccountService;

  @Post('/page')
  @ApiOperation({ summary: '分页获取列表' })
  async page(@Body() accountDto: AccountPageDTO) {
    const res = await this.accountService.page(accountDto);
    return this.success(res);
  }

  @Post('/wxLogin')
  @ApiOperation({ summary: '微信小程序登录' })
  async wxLogin(@Body() accountDto: AccountWxDTO) {
    const res = await this.accountService.xwLogin(accountDto);
    return this.success(res);
  }

  @Get('/info')
  @ApiOperation({ summary: '查询详情' })
  async info(@Query('id') id: number) {
    const uid = id || this.ctx.uid;
    const res = await this.accountService.info(uid);
    return this.success(res);
  }

  @Post('/create')
  @Validate()
  @ApiOperation({ summary: '添加' })
  async create(@Body() dto: AccountCreateDTO) {
    const res = await this.accountService.create(dto);
    return this.success(res);
  }

  @Put('/update')
  @Validate()
  @ApiOperation({ summary: '更新' })
  async update(@Body() account: AccountUpdateDTO) {
    const res = await this.accountService.update(account);
    return this.success(res);
  }

  @Del('/delete')
  @Validate()
  @ApiOperation({ summary: '删除' })
  async delete(@Query('id') id: number) {
    const res = await this.accountService.delete(id);
    return this.success(res);
  }
}
