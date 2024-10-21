import { Primitives } from '@/modules/shared/domain/types/Primitives';
import { PrismaClient } from '@prisma/client';
import { Subscription } from '../domain/subscription';
import { SubscriptionRepository } from '../domain/subscription-repository';

export class PrismaSubscriptionRepository implements SubscriptionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  get model() {
    return this.prisma.subscription;
  }

  async save(subscription: Subscription): Promise<void> {
    const data = subscription.toPrimitives();
    await this.model.upsert({
      where: { id: subscription.id.value },
      update: data,
      create: data,
    });
  }
  async list(where: Record<string, any>): Promise<Subscription[]> {
    const subscriptions = await this.model.findMany({ where });
    return subscriptions.map((subscription) => Subscription.fromPrimitives(subscription as Primitives<Subscription>));
  }
  async get(where: any): Promise<Subscription | null> {
    const subscription = await this.model.findUnique({ where });
    if (!subscription) return null;
    return Subscription.fromPrimitives(subscription as Primitives<Subscription>);
  }
}
