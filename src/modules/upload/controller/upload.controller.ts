import { Controller, Post, Inject, Body, Files } from '@midwayjs/core';
import { UploadService } from '../service/upload.service';
import { Validate } from '@midwayjs/validate';

import { UploadFileInfo, UploadMiddleware } from '@midwayjs/busboy';
import { BaseController } from '../../base/base.controller';

@Controller('/upload')
export class UploadController extends BaseController {
  @Inject()
  uploadService: UploadService;

  @Post('/file', { middleware: [UploadMiddleware] })
  async upload(@Files() files: Array<UploadFileInfo>) {
    console.log('上传文件', files);

    // 调用服务处理文件
    const result = await this.uploadService.upload(files);
    return result;
  }

  @Post('/importExcel', { middleware: [UploadMiddleware] })
  async importExcel(@Files() files: Array<UploadFileInfo>) {
    // 调用服务处理文件
    const result = await this.uploadService.importExcel(files);
    return result;
  }
}
