import { SubscriptionRepository } from '../domain/subscription-repository';
import { SubscriptionService } from '../domain/subscription-service';

export class CreateBillingPortal {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async run(userId: string) {
    const subscription = await this.subscriptionRepository.get({ userId });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const url = await this.subscriptionService.createBillingPortalSession(subscription.customerId.value);

    return url;
  }
}
