import { Primitives } from '@/modules/shared/domain/types/Primitives';
import { Thread } from '@prisma/client';
import { ThreadCriteria } from '../domain/thread-criteria';
import { ThreadRepository } from '../domain/thread-repository';

export class ListThreads {
  constructor(private readonly threadRepository: ThreadRepository) {}

  async run(accountId: string, folder: string, done: boolean): Promise<Primitives<Thread>[]> {
    const criteria = ThreadCriteria.searchByFolder(accountId, folder, done);
    const response = await this.threadRepository.searchByCriteriaWithEmails(criteria);
    return response.map((thread) => thread.toPrimitives());
  }
}
