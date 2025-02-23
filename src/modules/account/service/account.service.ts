import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Like, Repository } from 'typeorm';
import { BaseService } from '../../base/base.service';
import {
  AccountCreateDTO,
  AccountPageDTO,
  AccountUpdateDTO,
} from '../dto/account.dto';
import { Account } from '../entity/account';

@Provide()
export class AccountService extends BaseService {
  @InjectEntityModel(Account)
  accountModel: Repository<Account>;

  async page(options: Partial<AccountPageDTO>) {
    const { id, name, code } = options;

    const where = {
      id,
      code,
      name: name ? Like(name + '%') : undefined,
    };

    const [list, count] = await this.accountModel.findAndCount({
      where,
      order: {
        id: 'DESC',
        createTime: 'DESC',
      },
      skip: (options.current - 1) * options.size,
      take: options.size,
    });

    return { list, count };
  }

  async info(id: number) {
    const info = await this.accountModel.findOne({ where: { id } });
    return info;
  }

  async create(inDto: AccountCreateDTO) {
    const { id } = await this.accountModel.save(inDto);
    return { id };
  }

  async update(upDto: AccountUpdateDTO) {
    return await this.accountModel.update(upDto.id, upDto);
  }

  async delete(id: number) {
    return await this.accountModel.delete(id);
  }
}
