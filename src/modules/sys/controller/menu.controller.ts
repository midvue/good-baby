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
import {
  MenuCreateDTO,
  MenuDTO,
  MenuPageDTO,
  MenuUpdateDTO,
} from '../dto/menu.dto';
import { MenuService } from '../service/menu.service';

@Controller('/sys/menu', { description: '菜单管理', tagName: 'menu' })
export class MenuController extends BaseController {
  @Inject()
  ctx: Context;

  @Inject()
  menuService: MenuService;

  @Post('/page')
  @ApiOperation({ summary: '分页获取列表' })
  async page(@Body() menuDto: MenuPageDTO) {
    const res = await this.menuService.page(menuDto);
    return this.success(res);
  }

  @Post('/list')
  @ApiOperation({ summary: '获取列表' })
  async list(@Body() menuDto: MenuDTO) {
    const res = await this.menuService.list(menuDto);
    return this.success(res);
  }

  @Post('/listByRole')
  @ApiOperation({ summary: '获取列表' })
  async listByRole(@Body() menuDto) {
    console.log(menuDto);

    const res = await this.menuService.listByRole(menuDto);
    return this.success(res);
  }

  @Get('/info')
  @ApiOperation({ summary: '查询' })
  async info(@Query('id') id: number) {
    const res = await this.menuService.info(id);
    return this.success(res);
  }

  @Post('/create')
  @Validate()
  @ApiOperation({ summary: '添加' })
  async create(@Body() dto: MenuCreateDTO) {
    const res = await this.menuService.create(dto);
    this.success(res);
  }

  @Post('/batchCreate')
  @Validate()
  @ApiOperation({ summary: '批量添加' })
  async batchCreate(@Body() dtos: Array<MenuCreateDTO>) {
    const res = await this.menuService.batchCreate(dtos);
    this.success(res);
  }

  @Put('/update')
  @Validate()
  @ApiOperation({ summary: '更新' })
  async update(@Body() menu: MenuUpdateDTO) {
    const res = await this.menuService.update(menu);
    return this.success(res);
  }

  @Del('/delete')
  @Validate()
  @ApiOperation({ summary: '删除' })
  async delete(@Query('id') id: number) {
    const res = await this.menuService.delete(id);
    return this.success(res);
  }
}
