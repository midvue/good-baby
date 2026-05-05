import {
  CommonJSFileDetector,
  Configuration,
  IMidwayApplication,
  MainApp,
} from '@midwayjs/core';
import * as info from '@midwayjs/info';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as dotenv from 'dotenv';

import * as jwt from '@midwayjs/jwt';
import * as redis from '@midwayjs/redis';
import * as swagger from '@midwayjs/swagger';
import * as orm from '@midwayjs/typeorm';
import { join, resolve } from 'path';

import { DefaultErrorFilter } from './filter/default.filter';
//import { ReportMiddleware } from './middleware/report.middleware';
import * as bullmq from '@midwayjs/bullmq';
import * as busboy from '@midwayjs/busboy';
import * as cron from '@midwayjs/cron';
import { JwtMiddleware } from './middleware/jwt';
dotenv.config({
  path: [
    resolve(process.cwd(), '.env.local'),
    resolve(process.cwd(), '.env.production'),
  ],
});

@Configuration({
  imports: [
    koa,
    validate,
    orm,
    jwt,
    redis,
    cron,
    busboy,
    bullmq,
    {
      component: swagger,
      enabledEnvironment: ['local'],
    },
    {
      component: info,
      enabledEnvironment: ['local'],
    },
  ],
  importConfigs: [join(__dirname, './config')],
  detector: new CommonJSFileDetector(),
})
export class MainConfiguration {
  @MainApp()
  app: IMidwayApplication;

  async onReady() {
    // add middleware
    this.app.useMiddleware([JwtMiddleware]);
    // add filter
    this.app.useFilter([DefaultErrorFilter]);
  }
}
