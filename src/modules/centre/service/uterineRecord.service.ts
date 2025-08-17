import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { In, Repository } from 'typeorm';
import { BaseService } from '../../base/base.service';
import {
  UterineRecordDTO,
  UterineRecordPageDTO,
} from '../dto/uterineRecord.dto';
import { UterineRecord } from '../entity/uterineRecord';

@Provide()
export class UterineRecordService extends BaseService {
  @InjectEntityModel(UterineRecord)
  uterineRecordModel: Repository<UterineRecord>;

  /**
   * 分页查询宫缩记录
   * @param dto 分页查询参数
   */
  async page(dto: UterineRecordPageDTO) {
    const { startTime, endTime } = dto;
    const where = {
      userId: dto.userId ? dto.userId : undefined,
      startTime: startTime,
      endTime: endTime,
    };
    const [list, count] = await this.uterineRecordModel.findAndCount({
      where,
      order: { id: 'DESC', startTime: 'DESC' },
      skip: (dto.current - 1) * dto.size,
      take: dto.size,
    });
    return { list, count };
  }

  /** 获取宫缩记录列表 */
  async list(dto: UterineRecordDTO) {
    // 再根据规则 查询当前用户 pointsRecord完成记录
    const list = await this.uterineRecordModel.find({
      where: { userId: dto.userId },
      order: { id: 'DESC' },
    });

    return list;
  }

  /**
   * 新增宫缩记录
   */
  async add(dto: UterineRecordDTO) {
    return await this.uterineRecordModel.save(
      Object.assign(new UterineRecord(), dto)
    );
  }

  /**
   * 批量删除宫缩记录
   */
  async deleteBatch(ids: string[]) {
    this.logger.info('删除宫缩记录', ids);
    return await this.uterineRecordModel.delete({
      userId: this.ctx.uid,
    });
  }
}
