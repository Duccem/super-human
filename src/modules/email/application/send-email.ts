import { Email } from '../domain/email';
import { EmailRepository } from '../domain/email-repository';

export class SendEmail {
  constructor(private readonly emailRepository: EmailRepository) {}

  async run(email: Email): Promise<void> {
    await this.emailRepository.save(email, { bcc: [], cc: [], to: [], replyTo: [] });
  }
}
