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
  RoleCreateDTO,
  RoleMenuUpDTO,
  RolePageDTO,
  RoleUpdateDTO,
  RoleUpStatusDTO,
} from '../dto/role.dto';
import { RoleService } from '../service/role.service';

@Controller('/sys/role', { description: '角色管理', tagName: 'role' })
export class RoleController extends BaseController {
  @Inject()
  ctx: Context;

  @Inject()
  roleService: RoleService;

  @Post('/page')
  @Validate()
  @ApiOperation({ summary: '分页获取列表' })
  async page(@Body() roleDto: RolePageDTO) {
    let uid = this.ctx.uid;
    uid = uid === 1 ? undefined : uid;
    const res = await this.roleService.page(uid, roleDto);
    return this.success(res);
  }

  @Get('/list')
  @ApiOperation({ summary: '查询角色列表' })
  async list() {
    const res = await this.roleService.list();
    return this.success(res);
  }

  @Get('/info')
  @ApiOperation({ summary: '查询详情' })
  async info(@Query('id') id: number) {
    const res = await this.roleService.info(id);
    return this.success(res);
  }

  @Post('/create')
  @Validate()
  @ApiOperation({ summary: '添加' })
  async create(@Body() dto: RoleCreateDTO) {
    const res = await this.roleService.create(dto);
    return this.success(res);
  }

  @Put('/update')
  @Validate()
  @ApiOperation({ summary: '更新' })
  async update(@Body() role: RoleUpdateDTO) {
    const res = await this.roleService.update(role);
    return this.success(res);
  }

  @Del('/delete')
  @Validate()
  @ApiOperation({ summary: '删除' })
  async delete(@Query('id') id: number) {
    const res = await this.roleService.delete(id);
    return this.success(res);
  }

  @Put('/updateStatus')
  @ApiOperation({ summary: '更新角色状态' })
  async updateStatus(@Query() role: RoleUpStatusDTO) {
    const res = await this.roleService.updateStatus(role);
    return this.success(res);
  }

  @Get('/roleMenuPermit')
  @ApiOperation({ summary: '查询角色权限信息' })
  async roleMenuPermit(@Query('id') id: number) {
    const res = await this.roleService.roleMenuPermit(id);
    return this.success(res);
  }

  @Put('/updateMenuPermit')
  @ApiOperation({ summary: '修改角色权限' })
  async menuPermit(@Body() dto: RoleMenuUpDTO) {
    const res = await this.roleService.updateMenuPermit(dto);
    return this.success(res);
  }
}
