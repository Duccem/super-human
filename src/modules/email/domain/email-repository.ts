import { Criteria } from '@/modules/shared/domain/core/Criteria';
import { Email } from './email';
import { EmailAddress } from './email-address';
import { EmailAttachment } from './email-attachment';

export interface EmailRepository {
  save(
    email: Email,
    emailAddressesRelated: {
      to: EmailAddress[];
      cc: EmailAddress[];
      bcc: EmailAddress[];
      replyTo: EmailAddress[];
    },
  ): Promise<void>;
  saveEmailAddresses(addresses: EmailAddress[]): Promise<EmailAddress[]>;
  saveEmailAttachments(attachments: EmailAttachment[]): Promise<void>;
  getByCriteria(criteria: Criteria): Promise<Email[]>;
  searchByCriteria(criteria: Criteria): Promise<Email[]>;
  listAddresses(accountId: string): Promise<EmailAddress[]>;
}
