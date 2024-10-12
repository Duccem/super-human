import { accountRouter } from '@/modules/account/presentation/trpc/router';
import { createCallerFactory, createTRPCRouter } from '@/modules/shared/infrastructure/trpc/trpc';
import { threadRouter } from '@/modules/thread/presentation/trpc/router';

export const appRouter = createTRPCRouter({
  account: accountRouter,
  thread: threadRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
