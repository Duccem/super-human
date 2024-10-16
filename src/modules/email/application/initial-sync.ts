import { EmailService } from '../domain/email-service';
import { SyncEmails } from './sync-emails';

export class InitialSync {
  constructor(
    private syncEmails: SyncEmails,
    private emailService: EmailService,
  ) {}

  async run(accessToken: string, accountId: string): Promise<void> {
    let syncResponse = await this.emailService.startSync(accessToken);
    while (!syncResponse.ready) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      syncResponse = await this.emailService.startSync(accessToken);
    }

    await this.syncEmails.run(syncResponse.syncUpdatedToken, accessToken, accountId);
    await this.emailService.createSubscription(accessToken);
  }
}
