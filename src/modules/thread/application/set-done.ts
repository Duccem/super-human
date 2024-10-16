import { ThreadRepository } from '../domain/thread-repository';

export class SetDone {
  constructor(private readonly threadRepo: ThreadRepository) {}

  async run(threadId?: string, threadIds?: string[]): Promise<void> {
    await this.threadRepo.toggleDone(true, threadId, threadIds);
  }
}
