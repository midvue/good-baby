import { uploadWhiteList } from '@midwayjs/busboy';
import { MidwayAppInfo, MidwayConfig } from '@midwayjs/core';
import { join } from 'node:path';

export default (appInfo: MidwayAppInfo) => {
  return {
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
          return `${info.timestamp} ${info.LEVEL} ${info.pid} ${
            info.labelText ?? ''
          }${info.message}`;
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

    busboy: {
      mode: 'file',
      //  最大上传文件大小，默认为 10mb
      fileSize: '10mb',
      whitelist: [...uploadWhiteList, '.xls', '.xlsx'],
      tmpdir: join(appInfo.appDir, 'midway-busboy-files'),
    },

    redis: {
      client: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB, 10),
      },
    },

    bullmq: {
      defaultConnection: {
        port: parseInt(process.env.REDIS_PORT, 10),
        host: process.env.REDIS_HOST,
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_BULLMQ_DB, 10),
      },
    },

    swagger: {
      title: 'good baby',
      description: 'good baby 宝宝成长系统',
      auth: {
        authType: 'bearer',
        addSecurityRequirements: true,
      },
    },
    snowflake: {
      instance_id: 1, // 实例ID，取值范围 0-31，默认为 0
      custom_epoch: 1734472500000, // 其实时间戳，默认为 （2024-12-18 05:55:00）
    },
    wx: {
      // 微信小程序配置 appid  secret  小程序id  小程序密钥
      miniapp: {
        appid: process.env.WX_MINIAPP_APPID,
        secret: process.env.WX_MINIAPP_SECRET,
      },
    },
    ai: {
      volcengine: {
        apiKey: process.env['VOLCENGINE_API_KEY'],
        baseURL: process.env['VOLCENGINE_API_BASE_URL'],
      },
      anthropic: {
        apiKey: process.env['ANTHROPIC_API_KEY'],
        baseURL: process.env['ANTHROPIC_BASE_URL'],
      },
    },
    subscribe: {
      /** 喂养提醒触发间隔（小时）；dev=0 立即触发，生产=3 正常提醒 */
      feedReminderIntervalHour: Number(
        process.env.SUBSCRIBE_FEED_INTERVAL_HOUR ?? 3
      ),
    },
  };
};
