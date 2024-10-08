import { db } from '@/modules/shared/infrastructure/prisma/PrismaConnection';
import { NextRequest, NextResponse } from 'next/server';
import { UpdateDeltaToken } from '../../application/update-delta-token';
import { PrismaAccountRepository } from '../../infrastructure/prisma-account-repository';

export const UpdateTokenController = async (req: NextRequest) => {
  try {
    const { accountId, storedDeltaToken } = await req.json();
    if (!accountId || !storedDeltaToken) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const useCase = new UpdateDeltaToken(new PrismaAccountRepository(db));
    await useCase.run(accountId, storedDeltaToken);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Error occurred' }, { status: 500 });
  }
};
