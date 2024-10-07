import { SyncResponse } from '@/modules/shared/infrastructure/aurinko/types';
import qStashClient from '@/modules/shared/infrastructure/events/QStashClient';
import { db } from '@/modules/shared/infrastructure/prisma/db';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export const POST = verifySignatureAppRouter(async (req: NextRequest) => {
  try {
    const { accountId, userId } = await req.json();
    if (!accountId || !userId) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    const account = await db.account.findUnique({ where: { id: accountId, userId } });
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }
    let syncResponse = await startSync(account.accessToken);
    while (!syncResponse.ready) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      syncResponse = await startSync(account.accessToken);
    }

    await qStashClient.publishJSON({
      url: `${process.env.NEXT_PUBLIC_URL}/api/webhooks/aurinko/update-sync`,
      body: {
        syncUpdatedToken: syncResponse.syncUpdatedToken,
        accessToken: account.accessToken,
        accountId,
      },
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Error occurred' }, { status: 500 });
  }
});

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
