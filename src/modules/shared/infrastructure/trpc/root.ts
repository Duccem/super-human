import { postRouter } from "@/modules/posts/routers/post";
import {
  createCallerFactory,
  createTRPCRouter,
} from "@/modules/shared/infrastructure/trpc/trpc";

export const appRouter = createTRPCRouter({
  post: postRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
