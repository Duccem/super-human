import { ChatInteraction } from './chat-interaction';

export interface ChatInteractionRepository {
  saveChatInteraction: (chatInteraction: ChatInteraction) => Promise<void>;
  findChatInteractionByUserId(userId: string): Promise<ChatInteraction | null>;
}
