import { AccountCriteria } from '../domain/account-criteria';
import { AccountRepository } from '../domain/account-repository';

export class GetAccount {
  constructor(private readonly accountRepository: AccountRepository) {}

  async run(accountId: string) {
    const account = await this.accountRepository.getByCriteria(AccountCriteria.byAccountIdCriteria(accountId));
    if (!account) throw new Error('Account not found');
    return account.toPrimitives();
  }
}
