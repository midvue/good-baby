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
    expiresIn: '7d', // https://github.com/vercel/ms
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
    auth: {
      authType: 'bearer',
    },
  },

  wx: {
    // 微信小程序配置 appid  secret  小程序id  小程序密钥
    miniapp: {
      appid: 'wx439728a6ea05a2a4',
      secret: '1c3905a4be6b6d7e8b71043d1ba6dcfb',
    },
  },
  snowflake: {
    instance_id: 1, // 实例ID，取值范围 0-31，默认为 0
    custom_epoch: 1734472500000, // 其实时间戳，默认为 （2024-12-18 05:55:00）
  },
} as MidwayConfig;
