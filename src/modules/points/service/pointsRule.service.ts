import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../base/base.service';
import { PointsRule } from '../entity/pointsRule';
import { PointsRuleCreateDTO, PointsRulePageDTO } from '../dto/pointsRule.dto';

@Provide()
export class PointsRuleService extends BaseService {
  @InjectEntityModel(PointsRule)
  pointsRuleModel: Repository<PointsRule>;

  /**
   * 分页查询积分规则
   * @param dto 分页查询参数
   */
  async page(dto: PointsRulePageDTO) {
    const [list, total] = await this.pointsRuleModel.findAndCount({
      skip: (dto.current - 1) * dto.size,
      take: dto.size,
    });
    return { list, total };
  }

  /**
   * 创建积分规则
   * @param data 积分规则数据
   */
  async create(data: PointsRuleCreateDTO) {
    const rule = this.pointsRuleModel.create(data);
    return await this.pointsRuleModel.save(rule);
  }
}
