import { AccountCriteria } from '../domain/account-criteria';
import { AccountRepository } from '../domain/account-repository';

export class ListMyAccounts {
  constructor(private readonly repository: AccountRepository) {}

  async run(userId: string) {
    return this.repository.searchByCriteria(AccountCriteria.byUserIdCriteria(userId));
  }
}
