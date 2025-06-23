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
  BabyFamilyCreateDTO,
  BabyFamilyDTO,
  BabyFamilyIdDTO,
  BabyFamilyListDTO,
  BabyFamilyPageDTO,
  BabyFamilyUpdateDTO,
} from '../dto/babyFamily.dto';
import { BabyFamilyService } from '../service/babyFamily.service';

@Controller('/babyFamily', {
  description: '家庭管理',
  tagName: 'babyFamily',
})
export class BabyFamilyController extends BaseController {
  @Inject()
  babyFamilyService: BabyFamilyService;

  @Post('/page')
  @ApiOperation({ summary: '分页获取列表' })
  async page(@Body() babyFamilyDto: BabyFamilyPageDTO) {
    const res = await this.babyFamilyService.page(babyFamilyDto);
    return this.success(res);
  }

  @Post('/list')
  @Validate()
  @ApiOperation({ summary: '获取列表' })
  async list(@Body() dto: BabyFamilyListDTO) {
    dto.userId = dto.userId || this.ctx.uid;
    const res = await this.babyFamilyService.list(dto);
    return this.success(res);
  }

  @Get('/info')
  @ApiOperation({ summary: '查询详情' })
  async info(@Query('id') id: number) {
    const uid = id || this.ctx.uid;
    const res = await this.babyFamilyService.info(uid);
    return this.success(res);
  }

  @Post('/relation')
  @Validate()
  @ApiOperation({ summary: '获取家庭关系' })
  async relation(babyDto: BabyFamilyIdDTO) {
    const res = await this.babyFamilyService.relation(babyDto);
    return this.success(res);
  }

  @Post('/create')
  @Validate()
  @ApiOperation({ summary: '添加' })
  async create(@Body() dto: BabyFamilyCreateDTO) {
    const res = await this.babyFamilyService.create(dto);
    return this.success(res);
  }

  @Put('/update')
  @Validate()
  @ApiOperation({ summary: '更新' })
  async update(@Body() babyFamily: BabyFamilyUpdateDTO) {
    const res = await this.babyFamilyService.update(babyFamily);
    return this.success(res);
  }

  @Del('/delete')
  @Validate()
  @ApiOperation({ summary: '删除' })
  async delete(@Query('id') id: number) {
    const res = await this.babyFamilyService.delete(id);
    return this.success(res);
  }
}
