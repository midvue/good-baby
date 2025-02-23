import { MidwayConfig } from '@midwayjs/core';
import path = require('path');

export default {
  typeorm: {
    dataSource: {
      default: {
        type: 'mysql',
        host: '127.0.0.1',
        port: 3306,
        username: 'psite',
        password: '524hk4KSBA5WzCGj',
        database: 'psite',
        synchronize: false,
        logging: false,
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
