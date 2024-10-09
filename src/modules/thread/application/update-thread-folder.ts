import { NotFoundError } from '@/modules/shared/domain/core/errors/NotFoundError';
import { Primitives } from '@/modules/shared/domain/types/Primitives';
import { Thread } from '../domain/thread';
import { ThreadCriteria } from '../domain/thread-criteria';
import { ThreadRepository } from '../domain/thread-repository';

export class UpdateThreadFolder {
  constructor(private readonly threadRepository: ThreadRepository) {}

  async run(threadId: string, data: Partial<Primitives<Thread>>): Promise<void> {
    const thread = await this.threadRepository.getByCriteria(ThreadCriteria.searchById(threadId));

    if (!thread) {
      throw new NotFoundError(`Thread with ID ${threadId} not found`);
    }

    const updatedThread = Thread.fromPrimitives({ ...thread.toPrimitives(), ...data });

    await this.threadRepository.save(updatedThread);
  }
}
