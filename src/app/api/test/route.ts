import { Email } from '@/modules/email/domain/email';
import { MongoDBEmailSearcher } from '@/modules/email/infrastructure/mogodb-email-searcher';
import { Primitives } from '@/modules/shared/domain/types/Primitives';
import { db } from '@/modules/shared/infrastructure/prisma/PrismaConnection';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (req: NextRequest) => {
  try {
    const emails = await db.email.findMany({ take: 5 });
    const searcher = new MongoDBEmailSearcher();
    await searcher.initialize();
    for (const record of emails) {
      const email = Email.fromPrimitives(record as Primitives<Email>);
      await searcher.insert(email);
    }
    const results = await searcher.vectorSearch({ prompt: 'Boosting Document Embeddings', numResults: 1 });
    return NextResponse.json({ message: 'Ok', results });
  } catch (error) {
    console.log('error', error);
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
};
