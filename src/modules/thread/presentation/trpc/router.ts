import { VerifyOwnership } from '@/modules/account/application/verify-ownership';
import { PrismaAccountRepository } from '@/modules/account/infrastructure/prisma-account-repository';
import { createTRPCRouter, protectedProcedure } from '@/modules/shared/infrastructure/trpc/trpc';
import { z } from 'zod';
import { GetThreadCount } from '../../application/get-thread-count';
import { PrismaThreadRepository } from '../../infrastructure/prisma-thread-repository';

export const threadRouter = createTRPCRouter({
  getThreadCount: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const verifyOwnership = new VerifyOwnership(new PrismaAccountRepository(ctx.db));
      const account = await verifyOwnership.run(input.accountId, ctx.auth.userId);
      const useCase = new GetThreadCount(new PrismaThreadRepository(ctx.db));
      return useCase.run(account.id.toString());
    }),
});
