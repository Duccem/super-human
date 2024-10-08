import { db } from '@/modules/shared/infrastructure/prisma/PrismaConnection';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { SyncAccount } from '../../application/sync-account';
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

    const useCase = new SyncAccount(new PrismaAccountRepository(db), new AurinkoAccountService());

    await useCase.run(code, userId);
    return NextResponse.redirect(new URL('/mail', req.url));
  } catch (error) {
    console.log('Error occurred', error);
    return NextResponse.json({ error: 'Error occurred' }, { status: 500 });
  }
};
