import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { In, Repository } from 'typeorm';
import { BaseService } from '../../base/base.service';
import {
  UterineRecordDTO,
  UterineRecordPageDTO,
} from '../dto/uterineRecord.dto';
import { UterineRecord } from '../entity/uterineRecord';
import { RedPacket } from '../entity/redPacket';
import {
  RedPacketDTO,
  RedPacketPageDTO,
  RedPacketUpdateDTO,
} from '../dto/redPacket.dto';

@Provide()
export class RedPacketService extends BaseService {
  @InjectEntityModel(RedPacket)
  redPacketModel: Repository<RedPacket>;

  /**
   * 分页查询红包记录
   * @param dto 分页查询参数
   */
  async page(dto: RedPacketPageDTO) {
    const { recordTime } = dto;
    const where = {
      userId: dto.userId ? dto.userId : undefined,
      recordTime: recordTime,
    };
    const [list, count] = await this.redPacketModel.findAndCount({
      where,
      order: { id: 'DESC', recordTime: 'DESC' },
      skip: (dto.current - 1) * dto.size,
      take: dto.size,
    });
    return { list, count };
  }

  /** 获取红包记录列表 */
  async list(dto: RedPacketDTO) {
    // 再根据规则 查询当前用户 pointsRecord完成记录
    const list = await this.redPacketModel.find({
      where: { userId: dto.userId },
      order: { id: 'DESC' },
    });
    const count = list.reduce((sum, item) => sum + (item.amount || 0), 0);
    return { list, count };
  }
  /**
   * 新增红包记录
   */
  async add(dto: RedPacketDTO) {
    return await this.redPacketModel.save(Object.assign(new RedPacket(), dto));
  }

  /**
   * 更新红包记录
   */
  async update(dto: RedPacketUpdateDTO) {
    return await this.redPacketModel.update(dto.id, dto);
  }

  /**
   * 批量删除红包记录
   */
  async delete(id: string) {
    return await this.redPacketModel.delete(id);
  }
}
