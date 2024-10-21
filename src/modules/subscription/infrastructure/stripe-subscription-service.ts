import Stripe from 'stripe';
import { SubscriptionService } from '../domain/subscription-service';

export class StripeSubscriptionService implements SubscriptionService {
  private client: Stripe;
  constructor() {
    this.client = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-09-30.acacia',
    });
  }

  async createSession(userId: string): Promise<string> {
    const session = await this.client.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_URL}/mail`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
      client_reference_id: userId.toString(),
    });
    return session.url || '';
  }

  async createBillingPortalSession(customerId: string): Promise<string> {
    const session = await this.client.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
    });
    return session.url || '';
  }
}
