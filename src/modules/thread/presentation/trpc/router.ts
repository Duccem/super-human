import { VerifyOwnership } from '@/modules/account/application/verify-ownership';
import { PrismaAccountRepository } from '@/modules/account/infrastructure/prisma-account-repository';
import { createTRPCRouter, protectedProcedure } from '@/modules/shared/infrastructure/trpc/trpc';
import { z } from 'zod';
import { GetThreadCount } from '../../application/get-thread-count';
import { GetThreadDetails } from '../../application/get-thread-details';
import { ListThreads } from '../../application/list-threads';
import { SetDone } from '../../application/set-done';
import { SetUndone } from '../../application/set-undone';
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
  listThreads: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        folder: z.string(),
        done: z.boolean(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const useCase = new ListThreads(new PrismaThreadRepository(ctx.db));
      return useCase.run(input.accountId, input.folder, input.done);
    }),
  getThread: protectedProcedure
    .input(z.object({ accountId: z.string(), threadId: z.string(), replyType: z.string() }))
    .query(async ({ ctx, input }) => {
      const verifyOwnership = new VerifyOwnership(new PrismaAccountRepository(ctx.db));
      const account = await verifyOwnership.run(input.accountId, ctx.auth.userId);
      const useCase = new GetThreadDetails(new PrismaThreadRepository(ctx.db));
      return useCase.run(account, input.threadId, input.replyType);
    }),
  setUndone: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        threadId: z.string().optional(),
        threadIds: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const verifyOwnership = new VerifyOwnership(new PrismaAccountRepository(ctx.db));
      await verifyOwnership.run(input.accountId, ctx.auth.userId);
      const useCase = new SetUndone(new PrismaThreadRepository(ctx.db));
      await useCase.run(input.threadId, input.threadIds);
    }),
  setDone: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        threadId: z.string().optional(),
        threadIds: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const verifyOwnership = new VerifyOwnership(new PrismaAccountRepository(ctx.db));
      await verifyOwnership.run(input.accountId, ctx.auth.userId);
      const useCase = new SetDone(new PrismaThreadRepository(ctx.db));
      await useCase.run(input.threadId, input.threadIds);
    }),
});
