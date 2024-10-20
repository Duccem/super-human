import { GetAccount } from '@/modules/account/application/get-account';
import { PrismaAccountRepository } from '@/modules/account/infrastructure/prisma-account-repository';
import { createTRPCRouter, protectedProcedure } from '@/modules/shared/infrastructure/trpc/trpc';
import { z } from 'zod';
import { ListEmailsSuggestions } from '../../application/list-emails-suggestions';
import { SendEmail } from '../../application/send-email';
import { VectorSearch } from '../../application/vector-search';
import { AurinkoEmailService } from '../../infrastructure/aurinko-email-service';
import { PrismaEmailRepository } from '../../infrastructure/prisma-email-repository';
import { MongoDBEmailSearcher } from '../../infrastructure/mogodb-email-searcher';

const emailAddressSchema = z.object({
  name: z.string(),
  address: z.string(),
});

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
  sendEmail: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        body: z.string(),
        subject: z.string(),
        from: emailAddressSchema,
        to: z.array(emailAddressSchema),
        cc: z.array(emailAddressSchema).optional(),
        bcc: z.array(emailAddressSchema).optional(),
        replyTo: emailAddressSchema,
        inReplyTo: z.string().optional(),
        threadId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const useCase = new SendEmail(new GetAccount(new PrismaAccountRepository(ctx.db)), new AurinkoEmailService());
      await useCase.run(input);
    }),
  search: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        query: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const getAccount = new GetAccount(new PrismaAccountRepository(ctx.db));
      const owner = await getAccount.run(input.accountId);
      const useCase = new VectorSearch(new MongoDBEmailSearcher());
      return await useCase.run(input.query, owner);
    }),
});
