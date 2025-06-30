import { Init, Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { BaseService } from '../../base/base.service';
import { PointsRecord } from '../entity/pointsRecord';
import { PointsRecordDTO, PointsRecordPageDTO } from '../dto/pointsRecord.dto';
import { EnumYesNoPlus, useDate } from '@mid-vue/shared';
import { PointsRule } from '../entity/pointsRule';
import { PointsSummaryService } from './pointsSummary.service';

@Provide()
export class PointsRecordService extends BaseService {
  @InjectEntityModel(PointsRecord)
  pointsRecordModel: Repository<PointsRecord>;

  @InjectEntityModel(PointsRule)
  pointsRuleModel: Repository<PointsRule>;

  @Inject()
  pointsSummaryService: PointsSummaryService;

  /**
   * 分页查询积分记录
   * @param dto 分页查询参数
   */
  async page(dto: PointsRecordPageDTO) {
    const { startDate, endDate } = dto;
    return {};
  }

  /** 获取积分记录列表 */
  async list(dto: PointsRecordDTO) {
    // 先查询pointRule所有 规则
    const rules = await this.pointsRuleModel.find();
    // 再根据规则 查询当前用户 pointsRecord完成记录
    let currUserRules = await this.pointsRecordModel.find({
      where: { userId: dto.userId, ruleCode: In(rules.map(rule => rule.code)) },
    });
    //合并规则和记录,去重
    const mergedRules = rules.map(rule => {
      const record = currUserRules.find(r => r.ruleCode === rule.code);
      return { ...rule, status: record?.status || EnumYesNoPlus.YES };
    });
    return mergedRules;
  }

  /**
   * 新增积分记录（由其他模块调用）
   * @param userId 用户ID
   * @param ruleKey 规则标识
   * @param changeType 变动类型（add/subtract）
   */
  async add(userId: string, ruleCode: string, changeType = EnumYesNoPlus.YES) {
    const rule = await this.pointsRuleModel.findOne({
      where: { code: ruleCode },
    });
    if (!rule) throw new Error('未找到积分规则');

    return await this.pointsRecordModel.insert({
      userId,
      changeType,
      status: EnumYesNoPlus.NO,
      ruleCode,
      points: changeType === EnumYesNoPlus.YES ? rule.points : -rule.points,
    });
  }

  /**
   * 更新积分记录
   * @param code 积分规则标识
   */
  async update(dto: PointsRecordDTO) {
    // 先查询对应的积分规则
    const rule = await this.pointsRuleModel.findOne({
      where: { code: dto.code },
    });
    if (!rule) throw new Error('未找到积分规则');

    // 先查询是否存在积分汇总记录，如果存在则更新，否则插入
    this.pointsSummaryService.insertOrUpdate({
      userId: dto.userId,
      date: useDate().format('YYYY-MM-DD'),
      todayPoints: rule.points,
      totalPoints: rule.points,
    });

    return await this.pointsRecordModel.update(
      { ruleCode: dto.code, userId: dto.userId },
      { status: '30' }
    );
  }
}
