import { accountRouter } from '@/modules/account/presentation/trpc/router';
import { interactionRouter } from '@/modules/chat-interaction/presentation/trpc/router';
import { emailRouter } from '@/modules/email/presentation/trpc/router';
import { createCallerFactory, createTRPCRouter } from '@/modules/shared/infrastructure/trpc/trpc';
import { threadRouter } from '@/modules/thread/presentation/trpc/router';

export const appRouter = createTRPCRouter({
  account: accountRouter,
  thread: threadRouter,
  email: emailRouter,
  interaction: interactionRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
