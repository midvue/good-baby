/**
 * 微信订阅消息模板 ID
 */
export enum EnumWxSubscribeTemplate {
  /** 喂养提醒（宝宝喂养消息提醒） */
  FEED_REMINDER = 'XoM2-Px0cYR6Jp8Rps37ChU3E6fI74H_2JC8-ot57Oo',
  /** 周报（宝宝喂养记录周报） */
  WEEKLY_REPORT = 'eqv7oJX9-J_rLHRa090RMYdYownIdWLaPGO1EjH8h58',
}

/**
 * 订阅消息下发参数
 */
export enum EnumWxSubscribeConfig {
  /** 单次扫描批量限制（查询记录数，去重后宝宝数会少于此值） */
  FEED_REMINDER_BATCH_LIMIT = 500,
}

/** 订阅消息点击跳转页面路径 */
export enum EnumWxSubscribePage {
  /** 喂养提醒 → 首页喂养记录列表 */
  FEED_REMINDER = 'pages/home/index',
  /** 周报 → 周报列表 */
  WEEKLY_REPORT = 'pages/sub-home/weekly/index',
}
