import { GetAccount } from '@/modules/account/application/get-account';
import { PrismaAccountRepository } from '@/modules/account/infrastructure/prisma-account-repository';
import { db } from '@/modules/shared/infrastructure/prisma/PrismaConnection';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { AskToAI } from '../application/ask-to-ai';
import { AiChatResultService } from '../infrastructure/ai-chat-result-service';
import { PrismaChatInteractionRepository } from '../infrastructure/prisma-chat-interaction-repository';
import { MongoDBEmailSearcher } from '@/modules/email/infrastructure/mogodb-email-searcher';

export const ChatController = async (req: NextRequest) => {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { messages, accountId } = await req.json();
    const useCase = new AskToAI(
      new PrismaChatInteractionRepository(db),
      new AiChatResultService(new MongoDBEmailSearcher()),
    );
    const getAccount = new GetAccount(new PrismaAccountRepository(db));
    const account = await getAccount.run(accountId);
    return await useCase.run(messages, userId, account);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'error' }, { status: 500 });
  }
};
