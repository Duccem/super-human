import { UpdateDeltaToken } from '@/modules/account/application/update-delta-token';
import { Primitives } from '@/modules/shared/domain/types/Primitives';
import { SaveThread } from '@/modules/thread/application/save-thread';
import { Thread } from '@/modules/thread/domain/thread';
import { Email } from '../domain/email';
import { EmailAttachment } from '../domain/email-attachment';
import { EmailRepository } from '../domain/email-repository';
import { EmailMessage, EmailService } from '../domain/email-service';

export class SyncEmails {
  constructor(
    private readonly emailRepository: EmailRepository,
    private readonly emailService: EmailService,
    private readonly updateDeltaToken: UpdateDeltaToken,
    private readonly saveThread: SaveThread,
  ) {}

  async run(syncUpdatedToken: string, accessToken: string, accountId: string): Promise<void> {
    let emailResponse = await this.emailService.getUpdatedEmails({ deltaToken: syncUpdatedToken }, accessToken);
    let emails = emailResponse.records;
    while (emailResponse.nextPageToken) {
      emailResponse = await this.emailService.getUpdatedEmails({ pageToken: emailResponse.nextPageToken }, accessToken);
      emails = emails.concat(emailResponse.records);
    }

    await this.saveEmails(emails, accountId);
    await this.updateDeltaToken.run(accountId, emailResponse.nextDeltaToken);
  }

  async saveEmails(records: EmailMessage[], accountId: string): Promise<void> {
    // preparamos para modificar los hilos y los correos
    const threads: { [key: string]: { emails: any[] } } = {};

    //recorremos todos los emails para preparar la data
    for (const email of records) {
      // Creamos la dirección de correo desde donde se manda el correo
      const from = Email.updateFromEmailAddress(email.from.address, email.from.name!, email.from.raw!, accountId);

      const { bcc, cc, replyTo, to } = Email.setEmailAddressesRelated(
        email.to,
        email.cc,
        email.bcc,
        email.replyTo,
        accountId,
      );

      const attachments = Email.createAttachments(
        email.attachments.map((a) => ({ ...a, emailId: emailEntity.id.value })) as Primitives<EmailAttachment>[],
      );

      const [[fromAddress], toAddresses, ccAddresses, bccAddresses, replyToAddresses] = await Promise.all([
        this.emailRepository.saveEmailAddresses([from]),
        this.emailRepository.saveEmailAddresses(to),
        this.emailRepository.saveEmailAddresses(cc),
        this.emailRepository.saveEmailAddresses(bcc),
        this.emailRepository.saveEmailAddresses(replyTo),
      ]);

      await this.emailRepository.saveEmailAttachments(attachments);

      // Creamos la entidad de correo
      const emailEntity = Email.Create(email, fromAddress.id.value);

      // Armamos la info actualizada del hilo
      const threadInfo = {
        id: email.threadId,
        subject: email.subject,
        lastMessageDate: email.sentAt,
        done: false,
        accountId,
        draftStatus: emailEntity.emailLabel.value === 'draft',
        inboxStatus: emailEntity.emailLabel.value === 'inbox',
        sentStatus: emailEntity.emailLabel.value === 'sent',
        participantIds: [
          ...new Set([
            fromAddress.id.value,
            ...toAddresses.map((a) => a!.id.value),
            ...ccAddresses.map((a) => a!.id.value),
            ...bccAddresses.map((a) => a!.id.value),
          ]),
        ],
      };

      await this.saveThread.run(threadInfo as unknown as Primitives<Thread>, threadInfo.id);

      await this.emailRepository.save(emailEntity, {
        to: toAddresses,
        cc: ccAddresses,
        bcc: bccAddresses,
        replyTo: replyToAddresses,
      });
      if (threads[email.threadId]) {
        threads[email.threadId].emails.push(emailEntity.toPrimitives());
      } else {
        threads[email.threadId] = { emails: [emailEntity.toPrimitives()] };
      }
    }

    const threadPromises = [];
    for (const threadId in threads) {
      const thread = threads[threadId];
      let threadFolderType = 'sent';
      threadFolderType = thread.emails.some((email) => email.emailLabel === 'draft') ? 'draft' : threadFolderType;
      threadFolderType = thread.emails.some((email) => email.emailLabel === 'inbox') ? 'inbox' : threadFolderType;

      threadPromises.push(
        this.saveThread.run(
          {
            id: threadId,
            draftStatus: threadFolderType === 'draft',
            inboxStatus: threadFolderType === 'inbox',
            sentStatus: threadFolderType === 'sent',
          } as unknown as Primitives<Thread>,
          threadId,
        ),
      );
    }
    await Promise.all(threadPromises);
  }
}
