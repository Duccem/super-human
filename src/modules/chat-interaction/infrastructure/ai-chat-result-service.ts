import { Account } from '@/modules/account/domain/account';
import { EmailSearcher } from '@/modules/email/domain/email-searcher';
import { Primitives } from '@/modules/shared/domain/types/Primitives';
import { Message, streamText } from 'ai';
import { ollama } from 'ollama-ai-provider';
import { ChatResultService } from '../domain/chat-result-servicee';

export class AiChatResultService implements ChatResultService {
  constructor(private emailSearcher: EmailSearcher) {}

  async getResponse(messages: any, account: Primitives<Account>, onFinish: (...args: any[]) => void) {
    await this.emailSearcher.initialize(account);
    const lastMessage = messages[messages.length - 1];

    const context = await this.emailSearcher.vectorSearch({ prompt: lastMessage.content });
    const prompt = this.buildPrompt(context);
    const response = await streamText({
      model: ollama('llama3.2'),
      messages: [prompt, ...messages.filter((message: Message) => message.role === 'user')],
      onFinish,
    });

    return response.toDataStreamResponse();
  }

  buildPrompt(context: any) {
    return {
      role: 'system',
      content: `You are an AI email assistant embedded in an email client app. Your purpose is to help the user compose emails by answering questions, providing suggestions, and offering relevant information based on the context of their previous emails.
      THE TIME NOW IS ${new Date().toLocaleString()}

      START CONTEXT BLOCK
      ${context.map((document: any) => JSON.stringify(document)).join('\n')}
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
}
