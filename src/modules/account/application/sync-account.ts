import { Account } from '../domain/account';
import { AccountRepository } from '../domain/account-repository';
import { AccountService } from '../domain/account-service';

export class SyncAccount {
  constructor(
    private accountRepository: AccountRepository,
    private accountService: AccountService,
  ) {}

  async run(code: string, userId: string): Promise<void> {
    const { accountId, accessToken } = await this.accountService.exchangeForAccessToken(code);
    const { email, name } = await this.accountService.getAccountDetails(accessToken);
    const account = Account.Create(accountId, userId, '', accessToken, email, name);
    await this.accountRepository.save(account);
  }
}
