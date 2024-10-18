import { Account } from '@/modules/account/domain/account';
import { Cuid } from '@/modules/shared/domain/core/value-objects/Cuid';
import { Primitives } from '@/modules/shared/domain/types/Primitives';
import { ChatInteraction } from '../domain/chat-interaction';
import { ChatInteractionRepository } from '../domain/chat-interaction-repository';
import { ChatResultService } from '../domain/chat-result-servicee';
export class AskToAI {
  constructor(
    private chatInteractionRepository: ChatInteractionRepository,
    private chatResultService: ChatResultService,
  ) {}

  async run(messages: any, userId: string, account: Primitives<Account>): Promise<any> {
    let interaction = await this.chatInteractionRepository.findChatInteractionByUserId(userId);
    if (!interaction) {
      interaction = ChatInteraction.Create(Cuid.random().value, new Date().toDateString(), 0, userId);
    } else if (interaction.isMaxCount()) {
      throw new Error('Max count reached');
    }
    return await this.chatResultService.getResponse(messages, account, async (response: any) => {
      interaction.incrementCount();
      await this.chatInteractionRepository.saveChatInteraction(interaction);
    });
  }
}
