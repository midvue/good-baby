import { MidwayConfig } from '@midwayjs/core';

export default {
  koa: {
    port: 7202,
  },

  validate: {
    validationOptions: {
      stripUnknown: true, // 全局生效
    },
  },

  midwayLogger: {
    default: {
      maxFiles: '3d',
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
  snowflake: {
    instance_id: 1, // 实例ID，取值范围 0-31，默认为 0
    custom_epoch: 1734472500000, // 其实时间戳，默认为 （2024-12-18 05:55:00）
  },
} as MidwayConfig;
