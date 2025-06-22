export enum EnumRespCode {
  /** 成功 */
  SUCCESS = 0,
  /** 失败 */
  FAIL = -1,
  /** 未登录 */
  UNAUTHORIZED = 401,
  /** 无权限 */
  FORBIDDEN = 403,
  /** 未找到 */
  NOT_FOUND = 404,
  /** 方法不允许 */
  METHOD_NOT_ALLOWED = 405,
  /** 超时 */
  REQUEST_TIMEOUT = 408,
  /** 冲突 */
  CONFLICT = 409,
  /** 缺少必填参数 */
  MISSING_PARAMETER = 1000,
  /** 时间超过范围 */
  TIMEOUT_RANGE = 1001,
  /** 数据不存在 */
  DATA_NOT_EXIST = 1002,
}

export const RespCodeMap = {
  [EnumRespCode.SUCCESS]: '成功',
  [EnumRespCode.FAIL]: '失败',
  [EnumRespCode.UNAUTHORIZED]: '未登录',
  [EnumRespCode.FORBIDDEN]: '无权限',
  [EnumRespCode.NOT_FOUND]: '未找到',
  [EnumRespCode.METHOD_NOT_ALLOWED]: '方法不允许',
  [EnumRespCode.REQUEST_TIMEOUT]: '超时',
  [EnumRespCode.CONFLICT]: '冲突',
  [EnumRespCode.MISSING_PARAMETER]: '缺少必填参数',
  [EnumRespCode.TIMEOUT_RANGE]: '时间超过范围',
  [EnumRespCode.DATA_NOT_EXIST]: '数据不存在',
} as const;
