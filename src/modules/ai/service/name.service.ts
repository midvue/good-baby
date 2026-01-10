import { Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel, TypeORMDataSourceManager } from '@midwayjs/typeorm';
import { In, Repository } from 'typeorm';
import { BaseService } from '../../base/base.service';

import { Name } from '../entity/name';
import { NameRecords } from '../entity/nameRecords';

@Provide()
export class NameService extends BaseService {
  @InjectEntityModel(Name)
  nameModel: Repository<Name>;

  @InjectEntityModel(NameRecords)
  nameRecordsModel: Repository<NameRecords>;

  @Inject()
  dataSourceMgr: TypeORMDataSourceManager;

  async info(name: string) {
    const info = await this.nameModel.findOne({ where: { name } });
    return info;
  }

  /** 新增姓名 */
  async add(dtoList: Partial<Omit<NameRecords, 'id'> & { count?: number }>[]) {
    //获取Name中已存在的姓名
    const nameList = await this.nameModel.find({
      select: ['name', 'count'],
      where: { name: In(dtoList.map(item => item.name)) },
    });
    //list转obj
    const nameObj = nameList.reduce((prev, cur) => {
      prev[cur.name] = cur.count;
      return prev;
    }, {} as Record<string, number>);

    //dtoList中存在的就count+1
    dtoList = dtoList.map(item => {
      const count = nameObj[item.name] || 0;
      item.count = count + 1;
      return item;
    });
    //对应人的查看记录数据
    const recordList = dtoList.map(item =>
      Object.assign(new NameRecords(), item)
    );

    console.log(recordList);

    const dataSource = this.dataSourceMgr.getDataSource('default');
    const res = await dataSource.transaction(async transMgr => {
      transMgr.upsert(Name, dtoList, ['name']);
      return await transMgr.upsert(NameRecords, recordList, ['name']);
    });
    return res;
  }
}
