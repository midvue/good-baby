/** 喂养类型 */
export enum EnumFeedType {
  /**奶瓶喂养 */
  MILK_BOTTLE = 10,
  /** 母乳亲喂 */
  BREAST_FEED_DIRECT = 20,
  /** 尿布 */
  DIAPER = 30,
  /** 身高体重 */
  HEIGHT_WEIGHT = 40,
  /** 黄疸 */
  JAUNDICE = 50,
  /** 睡眠 */
  SLEEP = 60,
  /** 辅食 */
  FOOD = 70,
  // /** 体温 */
  DEGRESS = 80,
  /** 补剂 */
  SUPPLEMENT = 90,
  // /** 疫苗 */
  VACCINE = 100,
  // /** 用药 */
  MEDICINE = 110,
}

/** 订阅授权状态 */
export enum EnumSubscribeStatus {
  /** 接收 */
  ACCEPT = 'accept',
  /** 拒收 */
  REJECT = 'reject',
  /** 已被禁止授权(用户在微信设置中关闭,后续无法再弹) */
  BAN = 'ban',
  /** 被规则过滤(已被下发过或命中频控) */
  FILTER = 'filter',
}
