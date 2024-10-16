import { AccountCriteria } from '../domain/account-criteria';
import { AccountRepository } from '../domain/account-repository';

export class SaveIndex {
  constructor(private readonly accountRepository: AccountRepository) {}

  async run(accountId: string, index: any): Promise<void> {
    const account = await this.accountRepository.getByCriteria(AccountCriteria.byAccountIdCriteria(accountId));
    if (!account) {
      throw new Error('Account not found');
    }
    account.binaryIndex = index;

    await this.accountRepository.save(account);
  }
}
