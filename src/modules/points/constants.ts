/**
 * 积分触发方式
 */
export enum EnumTriggerType {
  /** 手动领取 */
  MANUAL = '10',
  /** 自动到账 */
  AUTO = '20',
}

/**
 * 积分任务类型
 */
export enum EnumTaskType {
  /** 每日任务 */
  DAILY = '10',
  /** 一次性任务 */
  ONCE = '20',
  /** 行为触发 */
  ACTION = '30',
}

/**
 * 积分记录状态
 */
export enum EnumPointsStatus {
  /** 待领取（仅MANUAL类型使用） */
  PENDING = '10',
  /** 已到账 */
  SETTLED = '20',
}

/**
 * 积分变动类型
 */
export enum EnumChangeType {
  /** 获得 */
  EARN = '10',
  /** 消耗 */
  CONSUME = '20',
}

/**
 * 积分规则标识
 */
export enum EnumRuleCode {
  /** 每日喂养 */
  DAILY_FEED = 'daily_feed',
  /** 关注公众号 */
  FOLLOW_OFFICIAL_ACCOUNT = 'follow_official_account',
  /** 分享给好友 */
  SHARE_TO_FRIEND = 'share_to_friend',
  /** 完善资料 */
  COMPLETE_PROFILE = 'complete_profile',
}

/**
 * 任务展示状态（list 返回给前端的 status，区别于 PointsRecord.status）
 * 与前端 EnumPointStatus 对齐
 */
export enum EnumTaskStatus {
  /** 去完成（未完成） */
  TODO = '10',
  /** 可领取（已完成待领取） */
  CLAIMABLE = '20',
  /** 已完成/已领取 */
  DONE = '30',
}

/**
 * 触发方式中文名映射
 */
export const triggerTypeNameMap: Record<string, string> = {
  [EnumTriggerType.MANUAL]: '手动领取',
  [EnumTriggerType.AUTO]: '自动到账',
};

/**
 * 任务类型中文名映射
 */
export const taskTypeNameMap: Record<string, string> = {
  [EnumTaskType.DAILY]: '每日任务',
  [EnumTaskType.ONCE]: '一次性任务',
  [EnumTaskType.ACTION]: '行为触发',
};
