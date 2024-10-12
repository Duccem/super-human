import { Criteria } from '@/modules/shared/domain/core/Criteria';
import { Primitives } from '@/modules/shared/domain/types/Primitives';
import { PrismaCriteriaConverter } from '@/modules/shared/infrastructure/prisma/PrismaCriteriaConverter';
import { PrismaClient } from '@prisma/client';
import { Account } from '../domain/account';
import { AccountRepository } from '../domain/account-repository';

export class PrismaAccountRepository implements AccountRepository {
  private converter = new PrismaCriteriaConverter();
  constructor(private client: PrismaClient) {}

  get model() {
    return this.client.account;
  }

  async save(account: Account): Promise<void> {
    await this.model.upsert({
      where: { id: account.id.value.toString() },
      create: account.toPrimitives(),
      update: account.toPrimitives(),
    });
  }

  async getByCriteria(criteria: Criteria): Promise<Account | null> {
    const { where } = this.converter.criteria(criteria);
    const account = await this.model.findFirst({ where });
    if (!account) return null;
    return Account.fromPrimitives(account as Primitives<Account>);
  }
  async searchByCriteria(criteria: Criteria): Promise<Account[]> {
    const { orderBy, where, skip, take } = this.converter.criteria(criteria);
    const accounts = await this.model.findMany({ where, orderBy, skip, take });
    return accounts.map((account) => Account.fromPrimitives(account as Primitives<Account>));
  }
}
