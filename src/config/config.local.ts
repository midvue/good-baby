import { MidwayConfig } from '@midwayjs/core';

export default {
  typeorm: {
    dataSource: {
      default: {
        type: 'mysql',
        host: '159.75.181.188',
        port: 3306,
        username: 'good_baby',
        password: '7D7NNmxdMAZL8Ck3',
        database: 'good_baby',
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
} as MidwayConfig;
