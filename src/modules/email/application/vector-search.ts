import { Account } from '@/modules/account/domain/account';
import { Primitives } from '@/modules/shared/domain/types/Primitives';
import { EmailSearcher } from '../domain/email-searcher';

export class VectorSearch {
  constructor(private readonly emailSearcher: EmailSearcher) {}

  async run(query: string, account: Primitives<Account>) {
    await this.emailSearcher.initialize(account);
    return await this.emailSearcher.search(query);
  }
}
