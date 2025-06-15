import { MidwayAppInfo, MidwayConfig } from '@midwayjs/core';

export default (appInfo: MidwayAppInfo): MidwayConfig => {
  return {
    keys: process.env.MIDWAY_KEYS,
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: '30d',
    },
    typeorm: {
      dataSource: {
        default: {
          type: 'mysql',
          host: process.env.MYSQL_HOST,
          port: parseInt(process.env.MYSQL_PORT, 10),
          username: process.env.MYSQL_USERNAME,
          password: process.env.MYSQL_PASSWORD,
          database: process.env.MYSQL_DATABASE,
          synchronize: true, // 如果第一次使用，不存在表，有同步的需求可以写 true
          logging: ['warn', 'error'],
          timezone: '+08:00',
          supportBigNumbers: true,
          bigNumberStrings: true,
          dateStrings: false,
          entities: ['**/entity/*'],
        },
      },
    },
    wx: {
      // 微信小程序配置 appid  secret  小程序id  小程序密钥
      miniapp: {
        appid: process.env.WX_MINIAPP_APPID,
        secret: process.env.WX_MINIAPP_SECRET,
      },
    },
  };
};
