import { ChatInteractionRepository } from '../domain/chat-interaction-repository';
import { MaxInteractions } from '../domain/max-interactions';

export class GetRemaining {
  constructor(private readonly interactionRepository: ChatInteractionRepository) {}

  async run(userId: string) {
    const chatInteraction = await this.interactionRepository.findChatInteractionByUserId(userId);
    if (!chatInteraction) {
      return {
        remainingInteractions: MaxInteractions.MAX_INTERACTIONS,
      };
    }
    const remainingInteractions = chatInteraction.getRemainingInteractions();
    return {
      remainingInteractions,
    };
  }
}
