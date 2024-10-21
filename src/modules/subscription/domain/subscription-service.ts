export interface SubscriptionService {
  createSession(userId: string): Promise<string>;
  createBillingPortalSession(customerId: string): Promise<string>;
}
