import { SubscriptionRepository } from '../domain/subscription-repository';

export class GetSubscriptionStatus {
  constructor(private readonly repository: SubscriptionRepository) {}

  async run(userId: string) {
    const subscription = await this.repository.get({ userId });
    if (!subscription) return false;
    return subscription.isActive();
  }
}
