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
import { DictCreateDTO, DictPageDTO, DictUpdateDTO } from '../dto/dict.dto';
import { DictService } from '../service/dict.service';

@Controller('/dict', {
  description: '字典管理',
  tagName: 'dict',
})
export class DictController extends BaseController {
  @Inject()
  userService: DictService;

  @Post('/page')
  @ApiOperation({ summary: '分页获取列表' })
  async page(@Body() userDto: DictPageDTO) {
    const res = await this.userService.page(userDto);
    return this.success(res);
  }

  @Get('/info')
  @ApiOperation({ summary: '查询详情' })
  async info(@Query('id') id: number) {
    const uid = id || this.ctx.uid;
    const res = await this.userService.info(uid);
    return this.success(res);
  }

  @Post('/create')
  @Validate()
  @ApiOperation({ summary: '添加' })
  async create(@Body() dto: DictCreateDTO) {
    const res = await this.userService.create(dto);
    return this.success(res);
  }

  @Put('/update')
  @Validate()
  @ApiOperation({ summary: '更新' })
  async update(@Body() user: DictUpdateDTO) {
    const res = await this.userService.update(user);
    return this.success(res);
  }

  @Del('/delete')
  @Validate()
  @ApiOperation({ summary: '删除' })
  async delete(@Query('id') id: number) {
    const res = await this.userService.delete(id);
    return this.success(res);
  }
}
