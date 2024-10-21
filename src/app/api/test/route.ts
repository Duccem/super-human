import { Email } from '@/modules/email/domain/email';
import { MongoDBEmailSearcher } from '@/modules/email/infrastructure/mogodb-email-searcher';
import { Primitives } from '@/modules/shared/domain/types/Primitives';
import { db } from '@/modules/shared/infrastructure/prisma/PrismaConnection';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { ollama } from 'ollama-ai-provider';

export const GET = async (req: NextRequest) => {
  try {
    const emails = await db.email.findMany({ take: 5 });
    const searcher = new MongoDBEmailSearcher();
    await searcher.initialize();
    for (const record of emails) {
      const email = Email.fromPrimitives(record as Primitives<Email>);
      await searcher.insert(email);
    }
    const results = await searcher.vectorSearch({
      prompt: 'LVPes está en directo: KNOCKOUT STAGE - DÍA 1 - WORLDS 2024',
      numResults: 1,
    });
    const docs = results.map((result: any) => {
      const { embeddings, ...data } = result;
      return data;
    });
    const prompt = buildPrompt(docs);
    console.log(prompt.content);
    const response = await generateText({
      model: ollama('llama3.2'),
      messages: [
        prompt,
        {
          role: 'user',
          content: 'Where the lvp was on live?',
        },
      ],
    });

    return NextResponse.json({ message: response.text });
  } catch (error) {
    console.log('error', error);
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
};

function buildPrompt(context: any): {
  role: 'system' | 'user' | 'assistant';
  content: string;
} {
  return {
    role: 'system',
    content: `You are an AI email assistant embedded in an email client app. Your purpose is to help the user compose emails by answering questions, providing suggestions, and offering relevant information based on the context of their previous emails.
    THE TIME NOW IS ${new Date().toLocaleString()}

    START CONTEXT BLOCK
    ${context.map((document: any) => `---- ${JSON.stringify(document)} ---`).join('\n')}
    END OF CONTEXT BLOCK

    When responding, please keep in mind:
    - Be helpful, clever, and articulate.
    - Rely on the provided email context to inform your responses.
    - If the context does not contain enough information to answer a question, politely say you don't have enough information.
    - Avoid apologizing for previous responses. Instead, indicate that you have updated your knowledge based on new information.
    - Do not invent or speculate about anything that is not directly supported by the email context.
    - Keep your responses concise and relevant to the user's questions or the email being composed.
  `,
  };
}
