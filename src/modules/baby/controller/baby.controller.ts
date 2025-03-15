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
  BabyCreateDTO,
  BabyDTO,
  BabyListDTO,
  BabyPageDTO,
  BabyUpdateDTO,
} from '../dto/baby.dto';
import { BabyService } from '../service/baby.service';

@Controller('/baby', {
  description: '宝宝管理',
  tagName: 'baby',
})
export class BabyController extends BaseController {
  @Inject()
  babyService: BabyService;

  @Post('/page')
  @ApiOperation({ summary: '分页获取列表' })
  async page(@Body() babyDto: BabyPageDTO) {
    const res = await this.babyService.page(babyDto);
    return this.success(res);
  }

  @Post('/list')
  @ApiOperation({ summary: '获取宝宝列表' })
  async list(@Body() dto: BabyListDTO) {
    dto.userId = dto.userId || this.ctx.uid;
    const res = await this.babyService.list(dto);
    return this.success(res);
  }

  @Get('/info')
  @ApiOperation({ summary: '查询详情' })
  async info(@Query('id') id: number) {
    const uid = id || this.ctx.uid;
    const res = await this.babyService.info(uid);
    return this.success(res);
  }

  @Post('/addFoster')
  @Validate()
  @ApiOperation({ summary: '添加喂养人' })
  async addFoster(@Body() dto: BabyCreateDTO) {
    dto.userId = dto.userId || this.ctx.uid;
    const res = await this.babyService.addFoster(dto);
    return this.success(res);
  }

  @Post('/create')
  @Validate()
  @ApiOperation({ summary: '添加' })
  async create(@Body() dto: BabyCreateDTO) {
    dto.userId = dto.userId || this.ctx.uid;
    const res = await this.babyService.create(dto);
    return this.success(res);
  }

  @Put('/update')
  @Validate()
  @ApiOperation({ summary: '更新' })
  async update(@Body() baby: BabyUpdateDTO) {
    const res = await this.babyService.update(baby);
    return this.success(res);
  }

  @Del('/delete')
  @Validate()
  @ApiOperation({ summary: '删除' })
  async delete(@Query('id') id: number) {
    const res = await this.babyService.delete(id);
    return this.success(res);
  }
}
