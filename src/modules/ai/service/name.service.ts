import { Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel, TypeORMDataSourceManager } from '@midwayjs/typeorm';
import {
  In,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { BaseService } from '../../base/base.service';

import { Name } from '../entity/name';
import { NameRecords } from '../entity/nameRecords';
import { NameKeyword } from '../entity/nameKeyword';
import { AiInterpretDTO, AINameDTO } from '../dto/ai.dto';

@Provide()
export class NameService extends BaseService {
  @InjectEntityModel(Name)
  nameModel: Repository<Name>;

  @InjectEntityModel(NameRecords)
  nameRecordsModel: Repository<NameRecords>;

  @InjectEntityModel(NameKeyword)
  nameKeywordModel: Repository<NameKeyword>;

  @Inject()
  dataSourceMgr: TypeORMDataSourceManager;

  /** 查询姓名描述 */
  async list(names: string[]) {
    return await this.nameModel.find({
      select: ['name', 'desc'],
      where: { name: In(names) },
      order: { count: 'DESC' },
    });
  }

  async listAll(dto: AINameDTO) {
    //查询所有姓名
    const names = await this.nameModel.find({
      select: ['name'],
      where: { gender: dto.gender },
      order: { count: 'DESC' },
    });

    return names;
  }

  async pageList(dto: AINameDTO) {
    if (dto.lastFindName) {
      //先根据dto.lastFindName查询位置
      const lastName = await this.nameModel.findOne({
        select: ['count', 'id'],
        where: { name: dto.lastFindName },
      });
      //我想查询lastFindName以后的数据

      // 如果有分页, 查询大于等于count的姓名
      const names = await this.nameModel.find({
        select: ['name', 'id'],
        take: 50,
        where: {
          gender: dto.gender,
          id: MoreThan(lastName.id),
        },
        order: { id: 'ASC' },
      });
      return names;
    }
    //先从names表查询50条姓名
    const names = await this.nameModel.find({
      select: ['name', 'id'],
      take: 50,
      where: { gender: dto.gender },
      order: { id: 'ASC' },
    });

    return names;
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

    const keywordObj = {} as Record<string, number>;
    //dtoList中存在的就count+1
    dtoList = dtoList.map(item => {
      const count = nameObj[item.name] || 0;
      item.count = count + 1;
      // 统计每个关键词的使用次数
      item.name.split('').forEach(keyword => {
        keywordObj[keyword] = (keywordObj[keyword] || 0) + 1;
      });
      return item;
    });

    //把dtoList中的name转成一个个keyword字母,去重,并插入NameKeyword表
    const keywordList = Object.keys(keywordObj).map(keyword => ({
      keyword,
      count: keywordObj[keyword],
    }));

    //对应人的查看记录数据
    const dataSource = this.dataSourceMgr.getDataSource('default');
    const res = await dataSource.transaction(async transMgr => {
      transMgr.upsert(Name, dtoList, ['name']);
      return await transMgr.upsert(NameKeyword, keywordList, ['keyword']);
    });
    return res;
  }

  /**
   *  更新姓名解释
   */
  async updateInterpretNames(
    dtoList: ({ name: string } & Name['desc'])[],
    interDto: AiInterpretDTO
  ) {
    // 把解释的json插入到name表的desc字段
    const nameList = dtoList.map(item => ({
      name: item.name,
      gender: interDto.gender,
      desc: {
        spell: item.spell,
        origin: item.origin,
        desc: item.desc,
      },
    }));

    // 把姓名与用户建立关系到name_records表
    const recordList = dtoList.map(item => {
      return Object.assign(new NameRecords(), {
        name: item.name,
        userId: interDto.userId,
        gender: interDto.gender,
      });
    });

    //对应人的查看记录数据
    const dataSource = this.dataSourceMgr.getDataSource('default');
    const res = await dataSource.transaction(async transMgr => {
      transMgr.upsert(Name, nameList, ['name']);
      return await transMgr.upsert(NameRecords, recordList, ['name']);
    });
    return res;
  }
}
