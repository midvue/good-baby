import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import * as orm from '@midwayjs/typeorm';
import * as upload from '@midwayjs/upload';
import * as swagger from '@midwayjs/swagger';
import * as jwt from '@midwayjs/jwt';
import { join } from 'path';
import { DefaultErrorFilter } from './filter/default.filter';
//import { ReportMiddleware } from './middleware/report.middleware';
import { JwtMiddleware } from './middleware/jwt';
import * as cron from '@midwayjs/cron';

@Configuration({
  imports: [
    koa,
    validate,
    orm,
    upload,
    jwt,
    cron,
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
    const rules = [
      { code: 'follow_wechat', description: '关注公众号', points: 200 },
      { code: 'add_baby', description: '添加宝宝信息', points: 50 },
      {
        code: 'add_first_feed',
        description: '添加第一条喂养信息',
        points: 50,
      },
      {
        code: 'add_daily_feed',
        description: '添加一次今天的喂养记录',
        points: 1,
      },
      { code: 'watch_ad', description: '观看1个广告', points: 50 },
      { code: 'invite_user', description: '邀请一个新用户', points: 100 },
      {
        code: 'invite_user_add_baby',
        description: '邀请的新用户添加宝宝信息',
        points: 50,
      },
      {
        code: 'invite_user_add_feed',
        description: '邀请的新用户分享添加喂养信息',
        points: 50,
      },
    ];
    console.log(rules);
  }
}
