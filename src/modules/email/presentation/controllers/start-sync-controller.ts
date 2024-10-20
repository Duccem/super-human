import { UpdateDeltaToken } from '@/modules/account/application/update-delta-token';
import { PrismaAccountRepository } from '@/modules/account/infrastructure/prisma-account-repository';
import { db } from '@/modules/shared/infrastructure/prisma/PrismaConnection';
import { SaveThread } from '@/modules/thread/application/save-thread';
import { PrismaThreadRepository } from '@/modules/thread/infrastructure/prisma-thread-repository';
import { verifySignatureAppRouter } from '@upstash/qstash/dist/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { InitialSync } from '../../application/initial-sync';
import { SaveVector } from '../../application/save-vector';
import { SyncEmails } from '../../application/sync-emails';
import { AurinkoEmailService } from '../../infrastructure/aurinko-email-service';
import { PrismaEmailRepository } from '../../infrastructure/prisma-email-repository';
import { MongoDBEmailSearcher } from '../../infrastructure/mogodb-email-searcher';

export const StartSyncController = verifySignatureAppRouter(async (req: NextRequest) => {
  try {
    const { accountId, userId } = await req.json();
    if (!accountId || !userId) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    const account = await db.account.findUnique({ where: { id: accountId, userId } });
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }
    const emailService = new AurinkoEmailService();
    const accountRepository = new PrismaAccountRepository(db);
    const useCase = new InitialSync(
      new SyncEmails(
        new PrismaEmailRepository(db),
        emailService,
        new UpdateDeltaToken(accountRepository),
        new SaveThread(new PrismaThreadRepository(db)),
        new SaveVector(new PrismaEmailRepository(db), new MongoDBEmailSearcher()),
      ),
      emailService,
    );
    await useCase.run(account.accessToken, accountId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Error occurred' }, { status: 500 });
  }
});
