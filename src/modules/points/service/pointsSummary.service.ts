import { isEmptyValue } from '@mid-vue/shared';
import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../base/base.service';
import {
  PointsSummaryDTO,
  PointsSummaryPageDTO,
} from '../dto/pointsSummary.dto';
import { PointsSummary } from '../entity/pointsSummary';

@Provide()
export class PointsSummaryService extends BaseService {
  @InjectEntityModel(PointsSummary)
  pointsSummaryModel: Repository<PointsSummary>;

  /**
   * 分页查询积分汇总记录
   * @param dto 分页查询参数
   */
  async page(dto: PointsSummaryPageDTO) {
    if (isEmptyValue(dto.userId)) {
      this.commError('用户ID不能为空');
    }
    const [list, total] = await this.pointsSummaryModel.findAndCount({
      where: {
        userId: dto.userId,
      },
      skip: (dto.current - 1) * dto.size,
      take: dto.size,
    });
    return { list, total };
  }

  /**
   * 获取指定用户的积分汇总（按 userId 单条查询）
   */
  async info(dto: PointsSummaryDTO) {
    if (isEmptyValue(dto.userId)) {
      this.commError('用户ID不能为空');
    }
    const summary = await this.pointsSummaryModel.findOne({
      where: { userId: dto.userId },
    });
    // 新用户无记录时返回默认值
    return (
      summary || {
        userId: dto.userId,
        totalPoints: 0,
        earnedPoints: 0,
        consumedPoints: 0,
      }
    );
  }

  /**
   * 累加积分到用户汇总（事务内调用）
   * @param summaryData 包含 userId 和要累加的积分值
   * @param manager 事务 manager，传入时使用事务 manager
   */
  async addPoints(
    summaryData: {
      userId: string;
      totalDelta: number;
      earnedDelta?: number;
      consumedDelta?: number;
    },
    manager?: any
  ) {
    // 参数校验
    if (isEmptyValue(summaryData.userId)) {
      this.commError('用户ID不能为空');
    }
    if (typeof summaryData.totalDelta !== 'number') {
      this.commError('积分变动值必须为数字');
    }

    const repo = manager
      ? manager.getRepository(PointsSummary)
      : this.pointsSummaryModel;

    // 先查询是否已有记录
    let summary = await repo.findOne({
      where: { userId: summaryData.userId },
    });
    if (!summary) {
      // 首次创建
      summary = new PointsSummary();
      summary.userId = summaryData.userId;
      summary.totalPoints = 0;
      summary.earnedPoints = 0;
      summary.consumedPoints = 0;
    }
    // 累加（不是覆盖）
    summary.totalPoints += summaryData.totalDelta;
    if (summaryData.earnedDelta) {
      summary.earnedPoints += summaryData.earnedDelta;
    }
    if (summaryData.consumedDelta) {
      summary.consumedPoints += summaryData.consumedDelta;
    }

    return await repo.save(summary);
  }
}
