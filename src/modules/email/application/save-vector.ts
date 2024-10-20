import { Email } from '../domain/email';
import { EmailCriteria } from '../domain/email-criteria';
import { EmailRepository } from '../domain/email-repository';
import { EmailSearcher } from '../domain/email-searcher';

export class SaveVector {
  constructor(
    private readonly emailRepository: EmailRepository,
    private readonly emailSearcher: EmailSearcher,
  ) {}

  async run(emailIds: string[]): Promise<void> {
    const emails = await this.emailRepository.searchByCriteria(EmailCriteria.inIds(emailIds));
    await this.emailSearcher.initialize();
    const saveInRepository = async (email: Email) => {
      await this.emailSearcher.insert(email);
    };
    const saveInVector = emails.map((email) => saveInRepository(email));
    await Promise.all(saveInVector);
  }
}
