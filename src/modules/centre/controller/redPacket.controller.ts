import {
  Body,
  Controller,
  Del,
  Inject,
  Post,
  Put,
  Query,
} from '@midwayjs/core';
import { ApiOperation, ApiTags } from '@midwayjs/swagger';
import { BaseController } from '../../base/base.controller';
import { RedPacketService } from '../service/redPacket.service';
import {
  RedPacketDTO,
  RedPacketPageDTO,
  RedPacketUpdateDTO,
} from '../dto/redPacket.dto';
import { Validate } from '@midwayjs/validate';

@ApiTags('红包记录')
@Controller('/centre/redPacket', { description: '红包记录相关接口' })
export class RedPacketController extends BaseController {
  @Inject()
  redPacketService: RedPacketService;

  @ApiOperation({ summary: '红包记录分页查询' })
  @Post('/page')
  async page(@Body() dto: RedPacketPageDTO) {
    dto.userId = dto.userId || this.ctx.uid;
    const res = await this.redPacketService.page(dto);
    return this.success(res);
  }

  @Post('/list')
  @ApiOperation({ summary: '红包记录列表查询' })
  async list(@Body() dto: RedPacketDTO) {
    dto.userId = dto.userId || this.ctx.uid;
    const res = await this.redPacketService.list(dto);
    return this.success(res);
  }

  @Post('/create')
  @Validate()
  @ApiOperation({ summary: '红包记录添加' })
  async add(@Body() dto: RedPacketDTO) {
    dto.userId = dto.userId || this.ctx.uid;
    const res = await this.redPacketService.add(dto);
    return this.success(res);
  }

  @Put('/update')
  @Validate()
  @ApiOperation({ summary: '更新' })
  async update(@Body() dto: RedPacketUpdateDTO) {
    const res = await this.redPacketService.update(dto);
    return this.success(res);
  }

  @Del('/delete')
  @Validate()
  @ApiOperation({ summary: '删除' })
  async delete(@Query('id') id: string) {
    const res = await this.redPacketService.delete(id);
    return this.success(res);
  }
}
