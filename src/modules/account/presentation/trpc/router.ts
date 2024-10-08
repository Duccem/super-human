import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '@/modules/shared/infrastructure/trpc/trpc';

export const accountRouter = createTRPCRouter({
  hello: publicProcedure.input(z.object({ text: z.string() })).query(({ input }) => {
    return {
      greeting: `Hello ${input.text}`,
    };
  }),

  create: publicProcedure.input(z.object({ name: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    console.log(ctx, input);
  }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    const account = await ctx.db.account.findFirst();

    return account ?? null;
  }),
});
