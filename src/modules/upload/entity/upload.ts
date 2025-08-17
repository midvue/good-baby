import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * 文件上传实体
 */
@Entity()
export class Upload {
  /**
   * 主键 ID
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 文件名
   */
  @Column({ type: 'varchar', length: 255, comment: '文件名' })
  fileName: string;

  /**
   * 文件类型
   */
  @Column({ type: 'varchar', length: 50, comment: '文件类型' })
  fileType: string;

  /**
   * 文件路径
   */
  @Column({ type: 'varchar', length: 512, comment: '文件路径' })
  filePath: string;
}
