import { Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel, TypeORMDataSourceManager } from '@midwayjs/typeorm';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { BaseService } from '../../base/base.service';
import { PointsRecord } from '../entity/pointsRecord';
import {
  PointsConsumeDTO,
  PointsRecordDTO,
  PointsRecordPageDTO,
} from '../dto/pointsRecord.dto';
import { isEmptyValue, useDate } from '@mid-vue/shared';
import { PointsRule } from '../entity/pointsRule';
import { PointsSummaryService } from './pointsSummary.service';
import {
  EnumChangeType,
  EnumPointsStatus,
  EnumTaskStatus,
  EnumTaskType,
  EnumTriggerType,
} from '../constants';

@Provide()
export class PointsRecordService extends BaseService {
  @InjectEntityModel(PointsRecord)
  pointsRecordModel: Repository<PointsRecord>;

  @InjectEntityModel(PointsRule)
  pointsRuleModel: Repository<PointsRule>;

  @Inject()
  pointsSummaryService: PointsSummaryService;

  @Inject()
  dataSourceMgr: TypeORMDataSourceManager;

  /**
   * 分页查询积分记录（流水）
   * @param dto 分页查询参数
   */
  async page(dto: PointsRecordPageDTO) {
    const where: Record<string, any> = {};

    // userId 有值时才过滤（admin 可查全部）
    if (!isEmptyValue(dto.userId)) {
      where.userId = dto.userId;
    }

    // 时间范围筛选
    if (dto.startDate && dto.endDate) {
      where.createTime = Between(
        useDate(dto.startDate).startOf('day').valueOf(),
        useDate(dto.endDate).endOf('day').valueOf()
      );
    } else if (dto.startDate) {
      where.createTime = MoreThanOrEqual(
        useDate(dto.startDate).startOf('day').valueOf()
      );
    } else if (dto.endDate) {
      where.createTime = LessThanOrEqual(
        useDate(dto.endDate).endOf('day').valueOf()
      );
    }

    // 变动类型筛选
    if (!isEmptyValue(dto.changeType)) {
      where.changeType = dto.changeType;
    }

    // 规则编码筛选
    if (!isEmptyValue(dto.ruleCode)) {
      where.ruleCode = dto.ruleCode;
    }

    const [list, count] = await this.pointsRecordModel.findAndCount({
      where,
      order: { createTime: 'DESC' },
      skip: (dto.current - 1) * dto.size,
      take: dto.size,
    });
    return { list, count };
  }

  /**
   * 获取积分任务列表（合并规则与用户完成状态）
   */
  async list(dto: PointsRecordDTO) {
    // 校验 userId
    if (isEmptyValue(dto.userId)) {
      this.commError('用户ID不能为空');
    }

    // 查询所有启用的规则
    const rules = await this.pointsRuleModel.find({
      where: { status: 1 },
    });
    if (rules.length === 0) {
      return [];
    }

    const todayStart = useDate().startOf('day').valueOf();
    const todayEnd = useDate().endOf('day').valueOf();

    // 查询该用户所有积分记录（用于判断任务完成情况）
    const userRecords = await this.pointsRecordModel.find({
      where: { userId: dto.userId },
    });

    // 合并规则和用户记录状态
    const mergedRules = rules.map(rule => {
      // 今日该规则的记录
      const todayRuleRecords = userRecords.filter(
        r =>
          r.ruleCode === rule.code &&
          r.createTime >= todayStart &&
          r.createTime <= todayEnd
      );

      // 所有该规则的历史记录（用于ONCE判断）
      const allRuleRecords = userRecords.filter(r => r.ruleCode === rule.code);

      const status = this.computeTaskStatus(
        rule,
        todayRuleRecords,
        allRuleRecords
      );

      return {
        id: rule.id,
        code: rule.code,
        title: rule.title,
        description: rule.description,
        points: rule.points,
        triggerType: rule.triggerType,
        taskType: rule.taskType,
        status,
      };
    });
    return mergedRules;
  }

  /**
   * 根据规则配置和用户记录，计算任务展示状态
   * @param rule 积分规则
   * @param todayRuleRecords 今日该规则的记录
   * @param allRuleRecords 历史该规则的所有记录
   */
  private computeTaskStatus(
    rule: PointsRule,
    todayRuleRecords: PointsRecord[],
    allRuleRecords: PointsRecord[]
  ): string {
    if (rule.triggerType === EnumTriggerType.AUTO) {
      return this.computeAutoTaskStatus(rule, todayRuleRecords, allRuleRecords);
    }
    // MANUAL 类型
    return this.computeManualTaskStatus(rule, todayRuleRecords, allRuleRecords);
  }

  /**
   * 计算 AUTO 类型的任务展示状态
   */
  private computeAutoTaskStatus(
    rule: PointsRule,
    todayRuleRecords: PointsRecord[],
    allRuleRecords: PointsRecord[]
  ): string {
    // AUTO 类型没有记录说明未完成
    if (todayRuleRecords.length === 0) {
      return EnumTaskStatus.TODO;
    }

    if (rule.taskType === EnumTaskType.ACTION && rule.limitPerDay > 0) {
      // ACTION 类型：检查每日积分上限
      const todayEarned = todayRuleRecords
        .filter(r => r.changeType === EnumChangeType.EARN)
        .reduce((sum, r) => sum + r.points, 0);
      if (todayEarned >= rule.limitPerDay * rule.points) {
        return EnumTaskStatus.DONE; // 已达上限
      }
    }

    // AUTO 类型有今日记录即算已完成
    return EnumTaskStatus.DONE;
  }

  /**
   * 计算 MANUAL 类型的任务展示状态
   */
  private computeManualTaskStatus(
    rule: PointsRule,
    todayRuleRecords: PointsRecord[],
    allRuleRecords: PointsRecord[]
  ): string {
    // 检查今日是否有待领取/已到账记录
    const settledRecord = todayRuleRecords.find(
      r => r.status === EnumPointsStatus.SETTLED
    );
    if (settledRecord) {
      return EnumTaskStatus.DONE; // 已领取
    }

    const pendingRecord = todayRuleRecords.find(
      r => r.status === EnumPointsStatus.PENDING
    );
    if (pendingRecord) {
      return EnumTaskStatus.CLAIMABLE; // 待领取
    }

    // 今日无记录
    if (rule.taskType === EnumTaskType.ONCE && allRuleRecords.length > 0) {
      // ONCE 类型已完成
      return EnumTaskStatus.DONE;
    }

    return EnumTaskStatus.TODO; // 去完成
  }

  /**
   * 新增积分记录（由其他模块调用）
   * AUTO 类型直接到账，MANUAL 类型待领取
   * @param userId 用户ID
   * @param ruleCode 规则标识
   * @param options.sourceId 关联业务ID
   * @param options.remark 备注
   */
  async add(
    userId: string,
    ruleCode: string,
    options?: { sourceId?: string; remark?: string }
  ) {
    // 参数校验
    if (isEmptyValue(userId)) {
      this.commError('用户ID不能为空');
    }
    if (isEmptyValue(ruleCode)) {
      this.commError('规则标识不能为空');
    }

    const rule = await this.pointsRuleModel.findOne({
      where: { code: ruleCode, status: 1 },
    });
    if (!rule) this.commError('未找到积分规则或规则已禁用');

    // ONCE 类型：检查是否已完成
    if (rule.taskType === EnumTaskType.ONCE) {
      const existRecord = await this.pointsRecordModel.findOne({
        where: { userId, ruleCode },
      });
      if (existRecord) return null;
    }

    // ACTION 类型：检查每日上限（防止刷单）
    if (rule.taskType === EnumTaskType.ACTION && rule.limitPerDay > 0) {
      const todayStart = useDate().startOf('day').valueOf();
      const todayEnd = useDate().endOf('day').valueOf();
      const todayRecords = await this.pointsRecordModel.find({
        where: {
          userId,
          ruleCode,
          changeType: EnumChangeType.EARN,
          createTime: Between(todayStart, todayEnd),
        },
      });
      const todayEarned = todayRecords.reduce((sum, r) => sum + r.points, 0);
      const maxPerDay = rule.limitPerDay * rule.points;

      // 已达或即将超过上限则不再产生积分
      if (todayEarned + rule.points > maxPerDay) return null;
    }

    // 根据触发方式决定状态
    const isAuto = rule.triggerType === EnumTriggerType.AUTO;
    const recordStatus = isAuto
      ? EnumPointsStatus.SETTLED
      : EnumPointsStatus.PENDING;

    const record = new PointsRecord();
    record.userId = userId;
    record.ruleCode = ruleCode;
    record.points = rule.points;
    record.status = recordStatus;
    record.changeType = EnumChangeType.EARN;
    record.sourceId = options?.sourceId;
    record.remark = options?.remark;

    // AUTO 类型：事务中同时写流水和累加余额
    if (isAuto) {
      const dataSource = this.dataSourceMgr.getDataSource('default');
      return await dataSource.transaction(async transMgr => {
        const savedRecord = await transMgr.save(PointsRecord, record);
        // 累加积分到 summary
        await this.pointsSummaryService.addPoints(
          {
            userId,
            totalDelta: rule.points,
            earnedDelta: rule.points,
          },
          transMgr
        );
        return savedRecord;
      });
    }

    // MANUAL 类型：只插入待领取记录，不修改 summary
    return await this.pointsRecordModel.save(record);
  }

  /**
   * 领取积分（MANUAL 类型，status: PENDING → SETTLED）
   * @param dto 包含 userId 和规则 code
   */
  async update(dto: PointsRecordDTO) {
    // 参数校验
    if (isEmptyValue(dto.userId)) {
      this.commError('用户ID不能为空');
    }
    if (isEmptyValue(dto.code)) {
      this.commError('规则标识不能为空');
    }

    // 查询该用户该规则的待领取记录
    const pendingRecord = await this.pointsRecordModel.findOne({
      where: {
        userId: dto.userId,
        ruleCode: dto.code,
        status: EnumPointsStatus.PENDING,
      },
    });
    if (!pendingRecord) {
      this.commError('该积分已领取或不存在待领取记录');
    }

    // 查询规则获取积分值
    const rule = await this.pointsRuleModel.findOne({
      where: { code: dto.code },
    });
    if (!rule) this.commError('未找到积分规则');

    // 事务中更新记录状态 + 累加 summary
    const dataSource = this.dataSourceMgr.getDataSource('default');
    return await dataSource.transaction(async transMgr => {
      // 更新记录状态为已到账
      await transMgr.update(
        PointsRecord,
        { id: pendingRecord.id },
        { status: EnumPointsStatus.SETTLED }
      );
      // 累加积分到 summary
      await this.pointsSummaryService.addPoints(
        {
          userId: dto.userId,
          totalDelta: rule.points,
          earnedDelta: rule.points,
        },
        transMgr
      );
      return { id: pendingRecord.id };
    });
  }

  /**
   * 消耗积分（商品兑换扣减）
   * @param dto 包含 userId、消耗积分值、备注
   */
  async consume(dto: PointsConsumeDTO) {
    // 参数校验
    if (isEmptyValue(dto.userId)) {
      this.commError('用户ID不能为空');
    }
    if (!dto.points || dto.points <= 0) {
      this.commError('消耗积分值必须为正数');
    }

    // 查询用户余额
    const summary = await this.pointsSummaryService.info({
      userId: dto.userId,
    });
    if (summary.totalPoints < dto.points) {
      this.commError('积分余额不足');
    }

    // 事务中插入消耗流水 + 扣减 summary
    const dataSource = this.dataSourceMgr.getDataSource('default');
    return await dataSource.transaction(async transMgr => {
      // 插入消耗流水（points 为负值）
      const record = new PointsRecord();
      record.userId = dto.userId;
      record.ruleCode = 'consume';
      record.points = -dto.points;
      record.status = EnumPointsStatus.SETTLED;
      record.changeType = EnumChangeType.CONSUME;
      record.remark = dto.remark || '商品兑换';
      const savedRecord = await transMgr.save(PointsRecord, record);

      // 扣减 summary
      await this.pointsSummaryService.addPoints(
        {
          userId: dto.userId,
          totalDelta: -dto.points,
          consumedDelta: dto.points,
        },
        transMgr
      );
      return savedRecord;
    });
  }

  /**
   * 获取用户今日获得积分
   * @param userId 用户ID
   */
  async getTodayPoints(userId: string) {
    // 参数校验
    if (isEmptyValue(userId)) {
      this.commError('用户ID不能为空');
    }

    const todayStart = useDate().startOf('day').valueOf();
    const todayEnd = useDate().endOf('day').valueOf();
    const records = await this.pointsRecordModel.find({
      where: {
        userId,
        changeType: EnumChangeType.EARN,
        createTime: Between(todayStart, todayEnd),
      },
    });
    const todayEarned = records.reduce((sum, r) => sum + r.points, 0);
    return { todayPoints: todayEarned };
  }
}
