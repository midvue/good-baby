import { Body, Controller, Inject, Post } from '@midwayjs/core';
import { ApiOperation, ApiTags } from '@midwayjs/swagger';
import { BaseController } from '../../base/base.controller';
import {
  UterineRecordDTO,
  UterineRecordPageDTO,
} from '../dto/uterineRecord.dto';
import { UterineRecordService } from '../service/uterineRecord.service';

@ApiTags('宫缩记录')
@Controller('/centre/uterineRecord', { description: '宫缩记录相关接口' })
export class UterineRecordController extends BaseController {
  @Inject()
  uterineRecordService: UterineRecordService;

  @ApiOperation({ summary: '宫缩记录分页查询' })
  @Post('/page')
  async page(@Body() dto: UterineRecordPageDTO) {
    dto.userId = dto.userId || this.ctx.uid;
    const res = await this.uterineRecordService.page(dto);

    return this.success(res);
  }

  @Post('/list')
  @ApiOperation({ summary: '宫缩记录列表查询' })
  async list(@Body() dto: UterineRecordDTO) {
    dto.userId = dto.userId || this.ctx.uid;
    const res = await this.uterineRecordService.list(dto);
    return this.success(res);
  }

  @Post('/add')
  @ApiOperation({ summary: '宫缩记录添加' })
  async add(@Body() dto: UterineRecordDTO) {
    dto.userId = dto.userId || this.ctx.uid;
    const res = await this.uterineRecordService.add(dto);
    return this.success(res);
  }

  @Post('/delete/batch')
  @ApiOperation({ summary: '宫缩记录批量删除' })
  async deleteBatch(@Body() ids: string[]) {
    const res = await this.uterineRecordService.deleteBatch(ids);
    return this.success(res);
  }
}
