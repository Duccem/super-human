import { NotFoundError } from '@/modules/shared/domain/core/errors/NotFoundError';
import { AccountCriteria } from '../domain/account-criteria';
import { AccountRepository } from '../domain/account-repository';

export class UpdateDeltaToken {
  constructor(private repository: AccountRepository) {}

  async run(accountId: string, deltaToken: string) {
    const criteria = AccountCriteria.byAccountIdCriteria(accountId);
    const account = await this.repository.getByCriteria(criteria);

    if (!account) throw new NotFoundError(`Account ID: ${accountId} not founded`);

    account.updateDeltaToken(deltaToken);

    await this.repository.save(account);
  }
}
