import { MidwayConfig } from '@midwayjs/core';

export default {
  typeorm: {
    dataSource: {
      default: {
        type: 'mysql',
        host: '102.0.0.1',
        port: 13308,
        username: 'good_baby',
        password: '1234456',
        database: 'good_baby',
        synchronize: true, // 如果第一次使用，不存在表，有同步的需求可以写 true
        logging: ['warn', 'error'],
        // dateStrings: true,
        timezone: '+08:00',
        entities: ['**/entity/*'],
      },
    },
  },
} as MidwayConfig;
