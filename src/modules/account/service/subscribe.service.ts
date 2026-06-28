import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { In, MoreThan, Repository } from 'typeorm';
import { BaseService } from '../../base/base.service';
import { Account } from '../entity/account';
import { SubscribeRecord } from '../entity/subscribeRecord';
import { SubscribeReportDTO } from '../dto/subscribe.dto';
import { EnumSubscribeStatus } from '../../../constants/dict';

@Provide()
export class SubscribeService extends BaseService {
  @InjectEntityModel(SubscribeRecord)
  subscribeRecordModel: Repository<SubscribeRecord>;

  @InjectEntityModel(Account)
  accountModel: Repository<Account>;

  /**
   * 累加配额（授权 accept 时调用）
   * 先尝试原子 increment，affected=0 表示记录不存在，再 save 新建
   */
  async addQuota(userId: string, templateId: string) {
    // 查 openid（走主键），冗余写入订阅表
    const account = await this.accountModel.findOne({
      select: ['id', 'openid'],
      where: { id: userId },
    });
    if (!account?.openid) {
      this.logger.warn(
        `[subscribe] addQuota 跳过：未找到账号或 openid 为空, userId=${userId}`
      );
      return;
    }

    // 原子自增；affected=0 表示记录不存在
    const result = await this.subscribeRecordModel.increment(
      { userId, templateId },
      'availableCount',
      1
    );
    if (result.affected && result.affected > 0) return;

    // 不存在则新建（并发时唯一索引兜底，第二个 save 会失败，忽略即可）
    try {
      await this.subscribeRecordModel.save(
        Object.assign(new SubscribeRecord(), {
          userId,
          openid: account.openid,
          templateId,
          availableCount: 1,
        })
      );
    } catch (err) {
      // 并发场景：已被其他请求创建，再次 increment 兜底
      await this.subscribeRecordModel.increment(
        { userId, templateId },
        'availableCount',
        1
      );
    }
  }

  /**
   * 扣减配额（下发成功时调用）
   * 用 decrement + MoreThan(0) 保证不超扣；同时更新 lastSendTime
   */
  async consumeQuota(userId: string, templateId: string) {
    const result = await this.subscribeRecordModel.decrement(
      { userId, templateId, availableCount: MoreThan(0) },
      'availableCount',
      1
    );
    if (!result.affected || result.affected === 0) return false;
    // 更新上次下发时间（喂养提醒防重复用）
    await this.subscribeRecordModel.update(
      { userId, templateId },
      { lastSendTime: new Date() }
    );
    return true;
  }

  /**
   * 上报订阅授权结果（前端调用）
   * accept 的累加配额，reject 忽略
   * @returns 成功累加配额的数量
   */
  async report(userId: string, dto: SubscribeReportDTO) {
    let count = 0;
    for (const item of dto.list) {
      if (item.status === EnumSubscribeStatus.ACCEPT) {
        await this.addQuota(userId, item.templateId);
        count++;
      }
    }
    return count;
  }

  /**
   * 批量查询多个用户对指定模板的可用配额记录（供 Processor 调用）
   */
  async getAvailableRecords(userIds: string[], templateId: string) {
    if (userIds.length === 0) return [];
    return this.subscribeRecordModel.find({
      where: {
        templateId,
        userId: In(userIds),
        availableCount: MoreThan(0),
      },
    });
  }
}
