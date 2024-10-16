import { GetAccount } from '@/modules/account/application/get-account';
import { EmailPayload, EmailService } from '../domain/email-service';

export class SendEmail {
  constructor(
    private getAccount: GetAccount,
    private emailService: EmailService,
  ) {}

  async run(payload: EmailPayload & { accountId: string }): Promise<void> {
    const account = await this.getAccount.run(payload.accountId);
    await this.emailService.sendEmail(payload, account.accessToken);
  }
}
