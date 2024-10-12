import { Primitives } from '@/modules/shared/domain/types/Primitives';
import { Account } from '../domain/account';
import { AccountCriteria } from '../domain/account-criteria';
import { AccountRepository } from '../domain/account-repository';

export class VerifyOwnership {
  constructor(private readonly accountRepository: AccountRepository) {}

  async run(accountId: string, userId: string): Promise<Primitives<Account>> {
    const account = await this.accountRepository.getByCriteria(AccountCriteria.byOwnershipCriteria(accountId, userId));
    if (!account) throw new Error('Account not found');
    return account.toPrimitives();
  }
}
