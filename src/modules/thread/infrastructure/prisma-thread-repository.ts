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
    await this.model.upsert({
      where: { id: thread.id.value },
      create: thread.toPrimitives(),
      update: thread.toPrimitives(),
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
}
