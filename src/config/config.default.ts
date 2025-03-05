import { MidwayConfig } from '@midwayjs/core';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1663495479148_225',
  koa: {
    port: 7202,
  },
  validate: {
    validationOptions: {
      stripUnknown: true, // 全局生效
    },
  },
  jwt: {
    secret: '9d894d70-e513-44d0-b30e-c7bf465d4a7',
    expiresIn: '2d', // https://github.com/vercel/ms
  },
  midwayLogger: {
    default: {
      maxFiles: '1d',
      datePattern: 'YYYY-MM-DD.log',
      format: info => {
        return `${info.timestamp} ${info.LEVEL} ${info.pid} ${info.labelText}${info.message}`;
      },
    },
    clients: {
      coreLogger: {
        fileLogName: 'core',
      },
      appLogger: {
        fileLogName: 'app',
      },
    },
  },

  upload: {
    // mode, 默认为file，可配置 stream
    mode: 'file',
    //  最大上传文件大小，默认为 10mb
    fileSize: '10mb',
  },
  swagger: {
    title: 'good baby',
    description: 'good baby 宝宝成长系统',
  },
} as MidwayConfig;
