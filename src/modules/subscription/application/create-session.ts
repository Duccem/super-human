import { SubscriptionService } from '../domain/subscription-service';

export class CreateSession {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  async run(userId: string) {
    return await this.subscriptionService.createSession(userId);
  }
}
