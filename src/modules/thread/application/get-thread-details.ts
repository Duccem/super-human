import { Account } from '@/modules/account/domain/account';
import { Primitives } from '@/modules/shared/domain/types/Primitives';
import { ThreadRepository } from '../domain/thread-repository';

export class GetThreadDetails {
  constructor(private readonly threadRepository: ThreadRepository) {}

  async run(account: Primitives<Account>, threadId: string, replyType: string): Promise<any> {
    const thread = await this.threadRepository.getByCriteriaWithEmails(threadId);

    if (!thread || !thread.emails || thread.emails.length === 0) throw new Error('No external email found in thread');

    const lastExternalEmail = thread.emails.reverse().find((email) => email.from?.id.value !== account.id);

    if (!lastExternalEmail) {
      throw new Error('No external email found in thread');
    }

    if (replyType === 'reply') {
      return {
        to: [lastExternalEmail.from?.toPrimitives()],
        cc: [],
        from: { name: account.name, address: account.emailAddress },
        subject: `${lastExternalEmail.subject.value}`,
        id: lastExternalEmail.internetMessageId.value,
      };
    } else if (replyType === 'replyAll') {
      return {
        to: [
          lastExternalEmail.from?.toPrimitives(),
          ...(lastExternalEmail.to
            ? lastExternalEmail.to.filter((addr) => addr.id.value !== account.id).map((v) => v.toPrimitives())
            : []),
        ],
        cc: lastExternalEmail.cc
          ? lastExternalEmail.cc.filter((addr) => addr.id.value !== account.id).map((e) => e.toPrimitives())
          : [],
        from: { name: account.name, address: account.emailAddress },
        subject: `${lastExternalEmail.subject.value}`,
        id: lastExternalEmail.internetMessageId.value,
      };
    }
  }
}
