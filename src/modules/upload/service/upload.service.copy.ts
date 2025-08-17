import { UploadFileInfo } from '@midwayjs/busboy';
import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import xlsx from 'node-xlsx';
import { Repository } from 'typeorm';
import { BaseService } from '../../base/base.service';
import { Upload } from '../entity/upload';

import { camelize, useDate } from '@mid-vue/shared';
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

    console.log(sheets, 22);

    const diaperTypeMap = {
      臭臭: '10',
      嘘嘘: '20',
      臭臭和嘘嘘: '30',
    };

    const poopTypeMap = {
      普通软糊状: '10',
      较干: '20',
      成型: '30',
      颗粒状: '40',
      水样状: '50',
      水便分离: '60',
      蛋花汤状: '70',
      血便: '80',
      油性大便: '90',
      豆腐渣样: '100',
      泡沫状: '110',
    };

    const poopColorMap = {
      黄色: '10',
      墨绿色: '20',
      棕色: '30',
      绿色: '40',
      红色: '50',
      黑色: '60',
      灰白色: '70',
    };

    let sheetStrategy = {
      奶瓶喂养: {
        getDatas: datas => {
          return datas.map(item => {
            const obj = new FeedRecord();
            let feedTime = useDate(item[0]).format('YYYY-MM-DD HH:mm:ss');
            let month = useDate(feedTime).format('M');
            return Object.assign(obj, {
              feedTime,
              feedType: 10,
              babyId: '65504853031388160',
              createId: +month <= 2 ? '65504470699607040' : '65520915693175808',
              content: {
                type: 10,
                volume: item[2],
                feedTime,
              },
              createTime: feedTime,
              updateTime: feedTime,
            });
          });
        },
      },
      换尿布: {
        //{"type": "10", "feedTime": "2025-06-17 15:00", "poopType": "10", "poopColor": "10"}
        // [{"ext": "poop", "code": "10", "name": "臭臭", "sort": 1}, {"ext": "pee", "code": "20", "name": "嘘嘘", "sort": 2}, {"ext": "both", "code": "30", "name": "臭臭和嘘嘘", "sort": 3}]
        getDatas: datas => {
          return datas.map(item => {
            const obj = new FeedRecord();
            let feedTime = useDate(item[0]).format('YYYY-MM-DD HH:mm:ss');
            let month = useDate(feedTime).format('M');
            return Object.assign(obj, {
              feedTime,
              feedType: 30,
              babyId: '65504853031388160',
              createId: +month <= 2 ? '65504470699607040' : '65520915693175808',
              content: {
                feedTime,
                diaperType: diaperTypeMap[item[1]] || '10',
                poopType: poopTypeMap[item[2]] || '10',
                poopColor: poopColorMap[item[3]] || '10',
              },
              createTime: feedTime,
              updateTime: feedTime,
            });
          });
        },
      },
    };

    let values = sheets.reduce((acc, sheet) => {
      let strategy = sheetStrategy[sheet.name];
      if (strategy) {
        let datas = strategy.getDatas(sheet.data);
        return acc.concat(datas);
      }
      return acc;
    }, []);

    const list = await this.feedRecordModel.save(values);
    return values;
  }
}
