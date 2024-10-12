import { ThreadRepository } from '../domain/thread-repository';

export class GetThreadCount {
  constructor(private readonly threadRepository: ThreadRepository) {}

  async run(accountId: string): Promise<{
    inbox: number;
    sent: number;
    drafts: number;
  }> {
    const [inbox, sent, drafts] = await Promise.all([
      this.threadRepository.count(accountId, 'inbox'),
      this.threadRepository.count(accountId, 'sent'),
      this.threadRepository.count(accountId, 'drafts'),
    ]);

    return {
      inbox,
      sent,
      drafts,
    };
  }
}
