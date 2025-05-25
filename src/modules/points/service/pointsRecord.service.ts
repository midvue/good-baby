import { Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, Between } from 'typeorm';
import { BaseService } from '../../base/base.service';
import { PointsRecord } from '../entity/pointsRecord';
import { PointsRecordPageDTO } from '../dto/pointsRecord.dto';
import { useDate } from '@mid-vue/shared';

@Provide()
export class PointsRecordService extends BaseService {
  @InjectEntityModel(PointsRecord)
  pointsRecordModel: Repository<PointsRecord>;

  /**
   * 分页查询积分记录
   * @param dto 分页查询参数
   */
  async getPage(dto: PointsRecordPageDTO) {
    const [start, end] = useDate().getDateRange(dto.startDate, dto.endDate);
    const [list, total] = await this.pointsRecordModel.findAndCount({
      where: {
        userId: dto.userId,
        createTime:
          dto.startDate && dto.endDate ? Between(start, end) : undefined,
      },
      relations: ['rule'],
      skip: (dto.current - 1) * dto.size,
      take: dto.size,
      order: { createTime: 'DESC' },
    });
    return { list, total };
  }

  /**
   * 新增积分记录（由其他模块调用）
   * @param userId 用户ID
   * @param ruleKey 规则标识
   * @param changeType 变动类型（add/subtract）
   */
  async addRecord(
    userId: number,
    ruleKey: string,
    changeType: 'add' | 'subtract'
  ) {
    // 实际需关联PointsRuleService获取规则详情，此处简化示例
    const rule = await this.pointsRecordModel.query(
      `SELECT * FROM points_rule WHERE ruleKey = ?`,
      [ruleKey]
    );
    if (!rule) throw new Error('未找到积分规则');
    return await this.pointsRecordModel.save({
      userId,
      rule: rule[0],
      changeType,
      changeScore: changeType === 'add' ? rule[0].score : -rule[0].score,
    });
  }
}
