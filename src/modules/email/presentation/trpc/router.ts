import { createTRPCRouter, protectedProcedure } from '@/modules/shared/infrastructure/trpc/trpc';
import { z } from 'zod';
import { ListEmailsSuggestions } from '../../application/list-emails-suggestions';
import { PrismaEmailRepository } from '../../infrastructure/prisma-email-repository';

export const emailRouter = createTRPCRouter({
  listSuggestions: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        query: z.string(),
      }),
    )
    .query(async ({ ctx }) => {
      const useCase = new ListEmailsSuggestions(new PrismaEmailRepository(ctx.db));
      const emails = await useCase.run(ctx.auth!.userId);
      return emails;
    }),
});
