'use server';

import { auth } from '@clerk/nextjs/server';

export const getAurinkoAuthUrl = async (serviceType: 'Google' | 'Office365') => {
  const { userId } = auth();
  if (!userId) {
    throw new Error('User not authenticated');
  }
  const params = new URLSearchParams({
    serviceType,
    clientId: process.env.AURINKO_CLIENT_ID!,
    scopes: 'Mail.ReadWrite Mail.Send Mail.Drafts',
    responseType: 'code',
    returnUrl: `${process.env.NEXT_PUBLIC_URL!}/api/webhooks/aurinko`,
  });

  return `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`;
};
