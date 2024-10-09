import { Primitives } from '@/modules/shared/domain/types/Primitives';
import { Thread } from '../domain/thread';
import { ThreadCriteria } from '../domain/thread-criteria';
import { ThreadRepository } from '../domain/thread-repository';

export class SaveThread {
  constructor(private repository: ThreadRepository) {}

  async run(thread: Primitives<Thread>, threadId: string) {
    const existingThread = await this.repository.getByCriteria(ThreadCriteria.searchById(threadId));
    let threadToSave;
    if (existingThread) {
      threadToSave = Thread.fromPrimitives({ ...existingThread.toPrimitives(), ...thread });
    } else {
      threadToSave = Thread.Create(
        threadId,
        thread.subject,
        thread.lastMessageDate,
        thread.participantIds,
        thread.accountId,
        thread.done,
        thread.inboxStatus,
        thread.draftStatus,
        thread.sentStatus,
      );
    }
    await this.repository.save(threadToSave);
  }
}
