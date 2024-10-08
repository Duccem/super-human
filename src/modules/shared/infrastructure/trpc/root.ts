import { accountRouter } from '@/modules/account/presentation/trpc/router';
import { createCallerFactory, createTRPCRouter } from '@/modules/shared/infrastructure/trpc/trpc';

export const appRouter = createTRPCRouter({
  account: accountRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
