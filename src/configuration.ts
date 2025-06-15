import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import * as dotenv from 'dotenv';

import * as orm from '@midwayjs/typeorm';
import * as swagger from '@midwayjs/swagger';
import * as jwt from '@midwayjs/jwt';
import { join, resolve } from 'path';
import { DefaultErrorFilter } from './filter/default.filter';
//import { ReportMiddleware } from './middleware/report.middleware';
import { JwtMiddleware } from './middleware/jwt';
import * as cron from '@midwayjs/cron';
import * as busboy from '@midwayjs/busboy';
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
    cron,
    busboy,
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
})
export class MainConfiguration {
  @App('koa')
  app: koa.Application;

  async onReady() {
    // add middleware
    this.app.useMiddleware([JwtMiddleware]);
    // add filter
    this.app.useFilter([DefaultErrorFilter]);
  }
}
