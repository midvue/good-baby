import { Rule, RuleType } from '@midwayjs/validate';

/**
 * 文件上传 DTO
 */
export class UploadDTO {
  /**
   * 文件名
   */
  @Rule(RuleType.string().max(255).required())
  fileName: string;

  /**
   * 文件类型
   */
  @Rule(RuleType.string().max(50).required())
  fileType: string;
}