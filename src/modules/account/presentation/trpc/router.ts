import { createTRPCRouter, protectedProcedure } from '@/modules/shared/infrastructure/trpc/trpc';
import { z } from 'zod';
import { GetAccount } from '../../application/get-account';
import { ListMyAccounts } from '../../application/list-my-accounts';
import { PrismaAccountRepository } from '../../infrastructure/prisma-account-repository';

export const accountRouter = createTRPCRouter({
  getMyAccounts: protectedProcedure.query(async ({ ctx }) => {
    const useCase = new ListMyAccounts(new PrismaAccountRepository(ctx.db));
    const accounts = await useCase.run(ctx.auth!.userId);
    return accounts.map((account) => account.toPrimitives());
  }),
  getMyAccount: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const useCase = new GetAccount(new PrismaAccountRepository(ctx.db));
      const account = await useCase.run(input.accountId);
      return account;
    }),
});
