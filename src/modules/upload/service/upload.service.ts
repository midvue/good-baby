import { UploadFileInfo } from '@midwayjs/busboy';
import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import xlsx from 'node-xlsx';
import { Repository } from 'typeorm';
import { BaseService } from '../../base/base.service';
import { Upload } from '../entity/upload';

import { camelize } from '@mid-vue/shared';
import { FeedRecord } from '../../baby/entity/feedRecord';

/**
 * 文件上传服务
 */
@Provide()
export class UploadService extends BaseService {
  @InjectEntityModel(Upload)
  uploadModel: Repository<Upload>;
  @InjectEntityModel(FeedRecord)
  feedRecordModel: Repository<FeedRecord>;

  /**
   * 处理文件上传
   * @param fields 表单字段
   */
  async upload(fields: UploadFileInfo[]) {
    // const uploadRecord = this.uploadModel.create(fields);
    // await this.uploadModel.save(uploadRecord);
    // return {
    //   message: '文件上传成功',
    //   uploadId: uploadRecord.id,
    // };
    return fields;
  }

  /**
   * 处理 Excel 文件上传
   * @param files 上传的文件
   */
  async importExcel(files: UploadFileInfo[]) {
    const file = files[0];
    const sheets = xlsx.parse(file.data, {
      type: 'buffer',
      cellDates: true,
      cellHTML: false,
      dateNF: 'yyyy-mm-dd hh:mm:ss',
      cellNF: true,
    });
    const sheet = sheets[0];

    const data = sheet.data;
    const heads = data[0];
    let keys = heads.map(key => {
      return camelize(key.replace(/_/g, '-'));
    });
    const values = data.slice(1);

    const result = values.map(item => {
      const obj = new FeedRecord();
      item.forEach((value, index) => {
        let key = keys[index];
        if (key === 'babyId') {
          value = '65504853031388160';
        } else if (key === 'createId') {
          value = value === '3' ? '65520915693175808' : value;
        }
        obj[key] = value;
      });
      return obj;
    });

    const list = await this.feedRecordModel.save(result);
    return list;
  }
}
