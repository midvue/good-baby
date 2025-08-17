import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { SnowIdBaseEntity } from '../../base/base.entity';

/**
 * 家庭管理
 */
@Entity('baby_family', { comment: '家庭管理' })
export class BabyFamily extends SnowIdBaseEntity {
  @Column({ comment: '家庭名称', length: 32, default: null })
  name: string;
}
