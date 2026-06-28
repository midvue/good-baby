import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../base/base.service';
import { PointsRule } from '../entity/pointsRule';
import {
  PointsRuleCreateDTO,
  PointsRulePageDTO,
  PointsRuleUpdateDTO,
} from '../dto/pointsRule.dto';

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
      order: { createTime: 'DESC' },
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
    // 检查 code 唯一性
    const exist = await this.pointsRuleModel.findOne({
      where: { code: data.code },
    });
    if (exist) {
      this.commError('规则标识已存在');
    }

    const rule = this.pointsRuleModel.create(data);
    return await this.pointsRuleModel.save(rule);
  }

  /**
   * 更新积分规则（code 不可修改）
   * @param data 积分规则更新数据
   */
  async update(data: PointsRuleUpdateDTO) {
    const { id, ...updateData } = data;
    const rule = await this.pointsRuleModel.findOne({ where: { id } });
    if (!rule) {
      this.commError('未找到积分规则');
    }

    // code 不可修改
    delete updateData.code;
    Object.assign(rule, updateData);
    return await this.pointsRuleModel.save(rule);
  }

  /**
   * 启用规则
   * @param id 规则ID
   */
  async enable(id: number) {
    const rule = await this.pointsRuleModel.findOne({ where: { id } });
    if (!rule) {
      this.commError('未找到积分规则');
    }
    return await this.pointsRuleModel.update(id, { status: 1 });
  }

  /**
   * 禁用规则
   * @param id 规则ID
   */
  async disable(id: number) {
    const rule = await this.pointsRuleModel.findOne({ where: { id } });
    if (!rule) {
      this.commError('未找到积分规则');
    }
    return await this.pointsRuleModel.update(id, { status: 0 });
  }
}
