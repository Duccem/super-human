import { Primitives } from '@/modules/shared/domain/types/Primitives';
import { PrismaClient } from '@prisma/client';
import { ChatInteraction } from '../domain/chat-interaction';
import { ChatInteractionRepository } from '../domain/chat-interaction-repository';

export class PrismaChatInteractionRepository implements ChatInteractionRepository {
  constructor(private client: PrismaClient) {}

  get model() {
    return this.client.chatbotInteraction;
  }

  async saveChatInteraction(chatInteraction: ChatInteraction): Promise<void> {
    const data = chatInteraction.toPrimitives();
    await this.model.upsert({
      where: { userId: data.userId, day: new Date().toDateString() },
      update: data,
      create: data,
    });
  }
  async findChatInteractionByUserId(userId: string): Promise<ChatInteraction | null> {
    const data = await this.model.findUnique({
      where: { day: new Date().toDateString(), userId },
    });

    if (!data) return null;

    return ChatInteraction.fromPrimitives(data as Primitives<ChatInteraction>);
  }
}
