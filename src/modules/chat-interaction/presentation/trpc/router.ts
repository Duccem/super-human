import { createTRPCRouter, protectedProcedure } from '@/modules/shared/infrastructure/trpc/trpc';
import { GetRemaining } from '../../application/get-remaining';
import { PrismaChatInteractionRepository } from '../../infrastructure/prisma-chat-interaction-repository';

export const interactionRouter = createTRPCRouter({
  getInteractions: protectedProcedure.query(async ({ ctx }) => {
    const useCase = new GetRemaining(new PrismaChatInteractionRepository(ctx.db));
    const interactions = await useCase.run(ctx.auth.userId);
    return interactions;
  }),
});
