import { createTRPCRouter, protectedProcedure } from '@/modules/shared/infrastructure/trpc/trpc';
import { ListMyAccounts } from '../../application/list-my-accounts';
import { PrismaAccountRepository } from '../../infrastructure/prisma-account-repository';

export const accountRouter = createTRPCRouter({
  getMyAccounts: protectedProcedure.query(async ({ ctx }) => {
    const useCase = new ListMyAccounts(new PrismaAccountRepository(ctx.db));
    const accounts = await useCase.run(ctx.auth!.userId);
    return accounts.map((account) => account.toPrimitives());
  }),
});
