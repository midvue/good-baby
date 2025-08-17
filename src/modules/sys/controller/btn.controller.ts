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
import { Context } from '@midwayjs/koa';
import { ApiOperation } from '@midwayjs/swagger';
import { Validate } from '@midwayjs/validate';
import { BaseController } from '../../base/base.controller';
import { BtnCreateDTO, BtnDTO, BtnPageDTO, BtnUpdateDTO } from '../dto/btn.dto';
import { BtnService } from '../service/btn.service';

@Controller('/sys/btn', { description: '基础按钮管理', tagName: 'btn' })
export class BtnController extends BaseController {
  @Inject()
  ctx: Context;

  @Inject()
  btnService: BtnService;

  @Post('/page')
  @ApiOperation({ summary: '分页获取列表' })
  async page(@Body() btnDto: BtnPageDTO) {
    const res = await this.btnService.page(btnDto);
    return this.success(res);
  }

  @Post('/list')
  @ApiOperation({ summary: '获取列表' })
  async list(@Body() btnDto: BtnDTO) {
    const res = await this.btnService.list(btnDto);
    return this.success(res);
  }

  @Get('/info')
  @ApiOperation({ summary: '查询' })
  async info(@Query('id') id: number) {
    const res = await this.btnService.info(id);
    return this.success(res);
  }

  @Post('/create')
  @Validate()
  @ApiOperation({ summary: '添加' })
  async create(@Body() dto: BtnCreateDTO) {
    const res = await this.btnService.create(dto);
    this.success(res);
  }

  @Put('/update')
  @Validate()
  @ApiOperation({ summary: '更新' })
  async update(@Body() btn: BtnUpdateDTO) {
    const res = await this.btnService.update(btn);
    return this.success(res);
  }

  @Del('/delete')
  @Validate()
  @ApiOperation({ summary: '删除' })
  async delete(@Query('id') id: number) {
    const res = await this.btnService.delete(id);
    return this.success(res);
  }
}
