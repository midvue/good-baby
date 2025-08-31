import { MidwayConfig } from '@midwayjs/core';

export default (): MidwayConfig => {
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
          logging: true,
          timezone: '+08:00',
          supportBigNumbers: true,
          bigNumberStrings: true,
          dateStrings: false,
          entities: ['**/entity/*'],
        },
      },
    },
  };
};
