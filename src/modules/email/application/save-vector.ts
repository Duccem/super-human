import { GetAccount } from '@/modules/account/application/get-account';
import { SaveIndex } from '@/modules/account/application/save-index';
import { Email } from '../domain/email';
import { EmailCriteria } from '../domain/email-criteria';
import { EmailRepository } from '../domain/email-repository';
import { EmailSearcher } from '../domain/email-searcher';

export class SaveVector {
  constructor(
    private readonly emailRepository: EmailRepository,
    private readonly emailSearcher: EmailSearcher,
    private readonly getAccount: GetAccount,
    private readonly saveIndex: SaveIndex,
  ) {}

  async run(emailIds: string[], accountId: string): Promise<void> {
    const emails = await this.emailRepository.searchByCriteria(EmailCriteria.inIds(emailIds));
    const account = await this.getAccount.run(accountId);
    this.emailSearcher.initialize(account);
    const saveInRepository = async (email: Email, accountId: string) => {
      await this.emailSearcher.insert(email);
      const index = this.emailSearcher.saveIndex();
      await this.saveIndex.run(accountId, index);
    };
    const saveInVector = emails.map((email) => saveInRepository(email, accountId));
    await Promise.all(saveInVector);
  }
}
