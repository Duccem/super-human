import { GetAccount } from '@/modules/account/application/get-account';
import { UpdateDeltaToken } from '@/modules/account/application/update-delta-token';
import { PrismaAccountRepository } from '@/modules/account/infrastructure/prisma-account-repository';
import { SaveVector } from '@/modules/email/application/save-vector';
import { SyncEmails } from '@/modules/email/application/sync-emails';
import { AurinkoEmailService } from '@/modules/email/infrastructure/aurinko-email-service';
import { MongoDBEmailSearcher } from '@/modules/email/infrastructure/mogodb-email-searcher';
import { PrismaEmailRepository } from '@/modules/email/infrastructure/prisma-email-repository';
import { db } from '@/modules/shared/infrastructure/prisma/PrismaConnection';
import { SaveThread } from '@/modules/thread/application/save-thread';
import { PrismaThreadRepository } from '@/modules/thread/infrastructure/prisma-thread-repository';
import { waitUntil } from '@vercel/functions';
import crypto from 'crypto';
import { NextRequest } from 'next/server';

const AURINKO_SIGNING_SECRET = process.env.AURINKO_SIGNING_SECRET;

export const POST = async (req: NextRequest) => {
  const query = req.nextUrl.searchParams;
  const validationToken = query.get('validationToken');
  if (validationToken) {
    return new Response(validationToken, { status: 200 });
  }

  const timestamp = req.headers.get('X-Aurinko-Request-Timestamp');
  const signature = req.headers.get('X-Aurinko-Signature');
  const body = await req.text();

  if (!timestamp || !signature || !body) {
    return new Response('Bad Request', { status: 400 });
  }

  const basestring = `v0:${timestamp}:${body}`;
  const expectedSignature = crypto.createHmac('sha256', AURINKO_SIGNING_SECRET!).update(basestring).digest('hex');

  if (signature !== expectedSignature) {
    return new Response('Unauthorized', { status: 401 });
  }
  type AurinkoNotification = {
    subscription: number;
    resource: string;
    accountId: number;
    payloads: {
      id: string;
      changeType: string;
      attributes: {
        threadId: string;
      };
    }[];
  };

  const payload = JSON.parse(body) as AurinkoNotification;
  const getAccount = new GetAccount(new PrismaAccountRepository(db));
  const account = await getAccount.run(payload.accountId.toString());
  if (!account) {
    return new Response('Account not found', { status: 404 });
  }
  const prismaEmailRepository = new PrismaEmailRepository(db);
  const accountRepository = new PrismaAccountRepository(db);
  const syncEmails = new SyncEmails(
    prismaEmailRepository,
    new AurinkoEmailService(),
    new UpdateDeltaToken(accountRepository),
    new SaveThread(new PrismaThreadRepository(db)),
    new SaveVector(prismaEmailRepository, new MongoDBEmailSearcher()),
  );

  waitUntil(
    syncEmails.run(account.nextDeltaToken, account.accessToken, account.id).then(() => console.log('Emails synced')),
  );

  // Process the notification payload as needed

  return new Response(null, { status: 200 });
};
