import { Subscription } from './subscription';

export interface SubscriptionRepository {
  save(subscription: Subscription): Promise<void>;
  list(where: Record<string, any>): Promise<Subscription[]>;
  get(where: Record<string, any>): Promise<Subscription | null>;
}
