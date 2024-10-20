import { InitialSync } from '@/modules/email/application/initial-sync';
import { SaveVector } from '@/modules/email/application/save-vector';
import { SyncEmails } from '@/modules/email/application/sync-emails';
import { AurinkoEmailService } from '@/modules/email/infrastructure/aurinko-email-service';
import { MongoDBEmailSearcher } from '@/modules/email/infrastructure/mogodb-email-searcher';
import { PrismaEmailRepository } from '@/modules/email/infrastructure/prisma-email-repository';
import { db } from '@/modules/shared/infrastructure/prisma/PrismaConnection';
import { SaveThread } from '@/modules/thread/application/save-thread';
import { PrismaThreadRepository } from '@/modules/thread/infrastructure/prisma-thread-repository';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { SyncAccount } from '../../application/sync-account';
import { UpdateDeltaToken } from '../../application/update-delta-token';
import { AurinkoAccountService } from '../../infrastructure/aurinko-account-service';
import { PrismaAccountRepository } from '../../infrastructure/prisma-account-repository';

export const syncAccountController = async (req: NextRequest) => {
  try {
    const { userId } = auth();
    const params = req.nextUrl.searchParams;
    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const code = params.get('code');
    const status = params.get('status');

    if (status !== 'success') return NextResponse.json({ error: 'Failed to link account' }, { status: 500 });
    if (!code) return NextResponse.json({ error: 'Code not provided' }, { status: 400 });

    const accountRepository = new PrismaAccountRepository(db);
    const emailService = new AurinkoEmailService();
    const useCase = new SyncAccount(
      accountRepository,
      new AurinkoAccountService(),
      new InitialSync(
        new SyncEmails(
          new PrismaEmailRepository(db),
          emailService,
          new UpdateDeltaToken(accountRepository),
          new SaveThread(new PrismaThreadRepository(db)),
          new SaveVector(new PrismaEmailRepository(db), new MongoDBEmailSearcher()),
        ),
        emailService,
      ),
    );

    await useCase.run(code, userId);
    return NextResponse.redirect(new URL('/mail', req.url));
  } catch (error) {
    console.log('Error occurred', error);
    return NextResponse.json({ error: 'Error occurred' }, { status: 500 });
  }
};
