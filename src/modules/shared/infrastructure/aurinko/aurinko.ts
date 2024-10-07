'use server';

import { auth } from '@clerk/nextjs/server';
import axios from 'axios';
import { EmailMessage, SyncResponse, SyncUpdatedResponse } from './types';

export const getAurinkoAuthUrl = async (serviceType: 'Google' | 'Office365') => {
  const { userId } = auth();
  if (!userId) {
    throw new Error('User not authenticated');
  }
  const params = new URLSearchParams({
    serviceType,
    client_id: process.env.AURINKO_CLIENT_ID!,
    scope: 'Mail.Read MailReadWrite Mail.Send Mail.Draft Mail.All',
    responseType: 'code',
    returnUrl: `${process.env.NEXT_PUBLIC_URL!}/api/webhooks/aurinko`,
  });

  return `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`;
};

export const exchangeForAccessToken = async (
  code: string,
): Promise<{
  accountId: string;
  accessToken: string;
  userId: string;
  userSession: string;
}> => {
  const response = await axios.post(
    `https://api.aurinko.io/v1/auth/token/${code}`,
    {},
    {
      auth: {
        username: process.env.AURINKO_CLIENT_ID!,
        password: process.env.AURINKO_CLIENT_SECRET!,
      },
    },
  );
  return response.data;
};

export const getAccountDetails = async (
  accessToken: string,
): Promise<{
  email: string;
  name: string;
}> => {
  const response = await axios.get('https://api.aurinko.io/v1/account', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

const startSync = async (accessToken: string): Promise<SyncResponse> => {
  const res = await axios.post<SyncResponse>(
    'https://api.aurinko.io/v1/email/sync',
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        daysWithin: 2,
        bodyType: 'html',
      },
    },
  );
  return res.data;
};

const getUpdatedEmails = async (
  { deltaToken, pageToken }: { deltaToken?: string; pageToken?: string },
  accessToken: string,
): Promise<SyncUpdatedResponse> => {
  let params: Record<string, string> = {};
  if (deltaToken) params.deltaToken = deltaToken;
  if (pageToken) params.pageToken = pageToken;

  const response = await axios.post<SyncUpdatedResponse>(
    'https://api.aurinko.io/v1/email/sync/updated',
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params,
    },
  );
  return response.data;
};

export const performInitialSync = async (accessToken: string) => {
  let syncResponse = await startSync(accessToken);
  while (!syncResponse.ready) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    syncResponse = await startSync(accessToken);
  }

  let storedDeltaToken = syncResponse.syncUpdatedToken;
  let updatedResponse = await getUpdatedEmails({ deltaToken: storedDeltaToken }, accessToken);
  if (updatedResponse.nextDeltaToken) {
    storedDeltaToken = updatedResponse.nextDeltaToken;
  }
  const allEmails: EmailMessage[] = updatedResponse.records;
  while (updatedResponse.nextPageToken) {
    updatedResponse = await getUpdatedEmails(
      { deltaToken: storedDeltaToken, pageToken: updatedResponse.nextPageToken },
      accessToken,
    );
    allEmails.concat(updatedResponse.records);
    if (updatedResponse.nextDeltaToken) {
      storedDeltaToken = updatedResponse.nextDeltaToken;
    }
  }

  return {
    emails: allEmails,
    deltaToken: storedDeltaToken,
  };
};

export const syncEmailsToDatabase = async (emails: EmailMessage[]) => {
  // Sync emails to database
};
