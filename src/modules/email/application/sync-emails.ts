import { UpdateDeltaToken } from '@/modules/account/application/update-delta-token';
import { Primitives } from '@/modules/shared/domain/types/Primitives';
import { SaveThread } from '@/modules/thread/application/save-thread';
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

    await this.updateDeltaToken.run(accountId, emailResponse.nextDeltaToken);
    await this.saveEmails(emails, accountId);
  }

  async saveEmails(records: EmailMessage[], accountId: string): Promise<void> {
    // preparamos para modificar los hilos y los correos
    const threads: any[] = [];
    const emailPromises: any[] = [];

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

      // Buscamos si el hilo ya existe o lo insertamos sino
      const threadIndex = threads.findIndex((t) => t.id === email.threadId);
      if (threadIndex !== -1) {
        threads[threadIndex] = threadInfo;
      } else {
        threads.push(threadInfo);
      }

      await this.emailRepository.save(emailEntity, {
        to: toAddresses,
        cc: ccAddresses,
        bcc: bccAddresses,
        replyTo: replyToAddresses,
      });
    }

    // Guardamos los hilos y los correos
    const threadPromises = threads.map((t) => this.saveThread.run(t, t.id));
    await Promise.all(threadPromises);
    await Promise.all(emailPromises);
  }
}
