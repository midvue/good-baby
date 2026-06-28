import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import {
  And,
  IsNull,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { BaseService } from '../../base/base.service';
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
    const where: any = {};

    if (dto.babyId) {
      where.babyId = dto.babyId;
    } else {
      where.userId = dto.userId;
      where.babyId = IsNull();
    }

    // 姓名筛选
    if (dto.name) {
      where.name = Like(`%${dto.name}%`); // 使用 % 作为通配符，匹配包含 dto.name 的字符串
    }

    // 称呼筛选
    if (dto.callName) {
      where.callName = dto.callName;
    }

    // 红包类型筛选
    if (dto.type) {
      where.type = dto.type;
    }

    // 金额范围筛选（minAmount <= amount <= maxAmount）
    if (dto.minAmount !== undefined || dto.maxAmount !== undefined) {
      let amountCondition: any;
      if (dto.minAmount !== undefined && dto.maxAmount !== undefined) {
        // 同时存在最小和最大金额，组合条件：amount >= min AND amount <= max
        amountCondition = And(
          MoreThanOrEqual(dto.minAmount),
          LessThanOrEqual(dto.maxAmount)
        );
      } else if (dto.minAmount !== undefined) {
        // 仅最小金额：amount >= min
        amountCondition = MoreThanOrEqual(dto.minAmount);
      } else {
        // 仅最大金额：amount <= max
        amountCondition = LessThanOrEqual(dto.maxAmount);
      }
      where.amount = amountCondition;
    }
    // 再根据规则 查询当前用户 pointsRecord完成记录
    const list = await this.redPacketModel.find({
      where,
      order: { recordTime: 'DESC' },
    });
    const count = list.reduce((sum, item) => sum + (item.amount || 0), 0);
    return { list, count };
  }
  /**
   * 新增红包记录
   */
  async add(dto: RedPacketDTO) {
    if (dto.babyId === '') {
      dto.babyId = null;
      dto.familyId = null;
    }
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
