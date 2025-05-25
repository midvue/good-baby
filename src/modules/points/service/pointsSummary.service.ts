import { Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../base/base.service';
import { PointsSummary } from '../entity/pointsSummary';
import { PointsSummaryPageDTO } from '../dto/pointsSummary.dto';

@Provide()
export class PointsSummaryService extends BaseService {
  @InjectEntityModel(PointsSummary)
  pointsSummaryModel: Repository<PointsSummary>;

  /**
   * 分页查询积分汇总记录
   * @param dto 分页查询参数
   */
  async getPage(dto: PointsSummaryPageDTO) {
    const [list, total] = await this.pointsSummaryModel.findAndCount({
      where: {
        userId: dto.userId,
        date: dto.date,
      },
      skip: (dto.current - 1) * dto.size,
      take: dto.size,
      order: { date: 'DESC' },
    });
    return { list, total };
  }
}
