import { UpdateDeltaToken } from '@/modules/account/application/update-delta-token';
import { Primitives } from '@/modules/shared/domain/types/Primitives';
import { SaveThread } from '@/modules/thread/application/save-thread';
import { Email } from '../domain/email';
import { EmailAttachment } from '../domain/email-attachment';
import { EmailRepository } from '../domain/email-repository';
import { EmailSensitivityValue } from '../domain/email-sensitivity';
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
      const fromAddress = Email.updateFromEmailAddress(
        email.from.address,
        email.from.name!,
        email.from.raw!,
        accountId,
      );
      // Creamos la entidad de correo
      const emailEntity = Email.Create(
        email.id,
        email.threadId,
        email.createdTime,
        email.lastModifiedTime,
        email.sentAt,
        email.receivedAt,
        email.internetMessageId,
        email.subject,
        email.sysLabels,
        email.keywords,
        email.sysClassifications,
        email.sensitivity as EmailSensitivityValue,
        email.meetingMessageMethod!,
        fromAddress.id.value,
        email.hasAttachments,
        email.body!,
        email.bodySnippet!,
        email.inReplyTo!,
        email.references!,
        email.threadIndex!,
        email.internetHeaders,
        email.nativeProperties,
        email.folderId!,
        email.omitted,
      );
      // Insertamos las direcciones de correo relacionadas y los adjuntos
      emailEntity.setEmailAddressesRelated(email.to, email.cc, email.bcc, email.replyTo, accountId);
      emailEntity.setAttachments(
        email.attachments.map((a) => ({ ...a, emailId: emailEntity.id.value })) as Primitives<EmailAttachment>[],
      );

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
            ...emailEntity.getEmailAddressesRelated().to.map((a) => a!.id.value),
            ...emailEntity.getEmailAddressesRelated().to.map((a) => a!.id.value),
            ...emailEntity.getEmailAddressesRelated().to.map((a) => a!.id.value),
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
      emailPromises.push(this.emailRepository.save(emailEntity));
    }

    // Guardamos los hilos y los correos
    const threadPromises = threads.map((t) => this.saveThread.run(t, t.id));
    await Promise.all(threadPromises);
    await Promise.all(emailPromises);
  }
}
