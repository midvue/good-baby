import { MidwayConfig } from '@midwayjs/core';

export default (): MidwayConfig => {
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
  };
};
