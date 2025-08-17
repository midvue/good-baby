import { Controller, Get } from '@midwayjs/core';
import { BaseController } from './base/base.controller';

@Controller('/')
export class HomeController extends BaseController {
  @Get('/')
  async home() {
    this.ctx.response.redirect('/swagger-ui/index.html');
  }
}
