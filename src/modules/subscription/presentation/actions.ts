'use server';
import { db } from '@/modules/shared/infrastructure/prisma/PrismaConnection';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { CreateBillingPortal } from '../application/create-billing-portal';
import { CreateSession } from '../application/create-session';
import { GetSubscriptionStatus } from '../application/get-subscription-status';
import { PrismaSubscriptionRepository } from '../infrastructure/prisma-subscription-repository';
import { StripeSubscriptionService } from '../infrastructure/stripe-subscription-service';

export async function getSubscriptionStatus() {
  const { userId } = auth();
  if (!userId) {
    return false;
  }
  const useCase = new GetSubscriptionStatus(new PrismaSubscriptionRepository(db));

  return useCase.run(userId);
}

export async function createCheckoutSession() {
  const { userId } = auth();

  if (!userId) {
    throw new Error('User not found');
  }

  const useCase = new CreateSession(new StripeSubscriptionService());

  const url = await useCase.run(userId);

  redirect(url!);
}

export async function createBillingPortalSession() {
  const { userId } = auth();

  if (!userId) {
    throw new Error('User not found');
  }

  const useCase = new CreateBillingPortal(new PrismaSubscriptionRepository(db), new StripeSubscriptionService());

  const url = await useCase.run(userId);

  redirect(url!);
}
