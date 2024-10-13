import { Criteria } from '@/modules/shared/domain/core/Criteria';
import { Primitives } from '@/modules/shared/domain/types/Primitives';
import { PrismaCriteriaConverter } from '@/modules/shared/infrastructure/prisma/PrismaCriteriaConverter';
import { PrismaClient } from '@prisma/client';
import { Thread } from '../domain/thread';
import { ThreadRepository } from '../domain/thread-repository';

export class PrismaThreadRepository implements ThreadRepository {
  private converter = new PrismaCriteriaConverter();
  constructor(private client: PrismaClient) {}

  get model() {
    return this.client.thread;
  }

  async save(thread: Thread): Promise<void> {
    const { emails, ...threadData } = thread.toPrimitives();
    await this.model.upsert({
      where: { id: thread.id.value },
      create: threadData,
      update: threadData,
    });
  }

  async searchByCriteria(criteria: Criteria): Promise<Thread[]> {
    const { orderBy, where, skip, take } = this.converter.criteria(criteria);
    const threads = await this.model.findMany({ where, orderBy, skip, take });
    return threads.map((thread) => Thread.fromPrimitives(thread as Primitives<Thread>));
  }

  async getByCriteria(criteria: Criteria): Promise<Thread | null> {
    const { where } = this.converter.criteria(criteria);
    const thread = await this.model.findFirst({ where });
    if (!thread) return null;
    return Thread.fromPrimitives(thread as Primitives<Thread>);
  }

  async count(accountId: string, folder: string): Promise<number> {
    let folderFilter = {};
    if (folder === 'inbox') {
      folderFilter = { inboxStatus: true };
    } else if (folder === 'sent') {
      folderFilter = { sentStatus: true };
    } else if (folder === 'drafts') {
      folderFilter = { draftStatus: true };
    }
    return this.model.count({ where: { accountId, ...folderFilter } });
  }

  async searchByCriteriaWithEmails(criteria: Criteria): Promise<Thread[]> {
    const { orderBy, where, skip, take } = this.converter.criteria(criteria);
    const threads = await this.model.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        emails: {
          orderBy: { sentAt: 'desc' },
          include: {
            from: true,
          },
        },
      },
    });

    return threads.map((thread) => Thread.fromPrimitives(thread as Primitives<Thread>));
  }
}
