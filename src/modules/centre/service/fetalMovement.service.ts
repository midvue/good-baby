import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../base/base.service';
import { FetalMovementDTO } from '../dto/fetalMovement.dto';
import { FetalMovement } from '../entity/fetalMovement';

@Provide()
export class FetalMovementService extends BaseService {
  @InjectEntityModel(FetalMovement)
  fetalMovementModel: Repository<FetalMovement>;

  /** 获取胎动记录列表 */
  async list(dto: FetalMovementDTO) {
    // 再根据规则 查询当前用户 pointsRecord完成记录
    const list = await this.fetalMovementModel.find({
      where: { userId: dto.userId },
      order: { id: 'DESC' },
    });

    return list;
  }

  /**
   * 新增胎动记录
   */
  async add(dto: FetalMovementDTO) {
    return await this.fetalMovementModel.save(
      Object.assign(new FetalMovement(), dto)
    );
  }
}
