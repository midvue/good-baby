import { MidwayConfig } from '@midwayjs/core';
import path = require('path');

console.log(process.env.MYSQL_HOST);

export default {
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

  midwayLogger: {
    default: {
      maxFiles: '5d',
      dir: path.join(process.cwd(), 'logs'),
    },
    clients: {
      coreLogger: {
        level: 'warn',
        consoleLevel: 'warn',
      },
      appLogger: {
        level: 'warn',
        consoleLevel: 'warn',
      },
    },
  },

  customConfig: {
    fileBaseUrl: '',
  },
} as MidwayConfig;
