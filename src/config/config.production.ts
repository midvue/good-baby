import { MidwayAppInfo, MidwayConfig } from '@midwayjs/core';

export default (_: MidwayAppInfo): MidwayConfig => {
  return {
    keys: process.env.MIDWAY_KEYS,
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    },
    typeorm: {
      dataSource: {
        default: {
          type: 'mysql',
          host: process.env.MYSQL_HOST,
          port: Number(process.env.MYSQL_PORT),
          username: process.env.MYSQL_USERNAME,
          password: process.env.MYSQL_PASSWORD,
          database: process.env.MYSQL_DATABASE,
          synchronize: false,
          logging: false,
          supportBigNumbers: true,
          bigNumberStrings: true,
          dateStrings: false,
          timezone: '+08:00',
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
