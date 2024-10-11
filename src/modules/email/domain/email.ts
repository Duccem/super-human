import { Aggregate } from '@/modules/shared/domain/core/Aggregate';
import { Uuid } from '@/modules/shared/domain/core/value-objects/Uuid';
import { BooleanValueObject, DateValueObject, StringValueObject } from '@/modules/shared/domain/core/ValueObject';
import { Primitives } from '@/modules/shared/domain/types/Primitives';
import { EmailAddress } from './email-address';
import { EmailAttachment } from './email-attachment';
import { EmailSensitivity, EmailSensitivityValue } from './email-sensitivity';
import { EmailMessage } from './email-service';
import { EmailSysLabels } from './email-syslabels';
import { Cuid } from '@/modules/shared/domain/core/value-objects/Cuid';

export class Email extends Aggregate {
  constructor(
    id: StringValueObject,
    public threadId: StringValueObject,
    public createdTime: DateValueObject,
    public lastModifiedTime: DateValueObject,
    public sentAt: DateValueObject,
    public receivedAt: DateValueObject,
    public internetMessageId: StringValueObject,
    public subject: StringValueObject,
    public sysLabels: EmailSysLabels,
    public keywords: StringValueObject[],
    public sysClassifications: StringValueObject[],
    public sensitivity: EmailSensitivity,
    public meetingMessageMethod: StringValueObject,
    public fromId: StringValueObject,
    public hasAttachments: BooleanValueObject,
    public body: StringValueObject,
    public bodySnippet: StringValueObject,
    public inReplyTo: StringValueObject,
    public references: StringValueObject,
    public threadIndex: StringValueObject,
    public internetHeaders: any[],
    public nativeProperties: Record<string, any>,
    public folderId: StringValueObject,
    public omitted: StringValueObject[],
    public emailLabel: StringValueObject,
    createdAt: DateValueObject,
    updatedAt: DateValueObject,
  ) {
    super(id, createdAt, updatedAt);
  }

  toPrimitives(): Primitives<Email> {
    return {
      id: this.id.toString(),
      threadId: this.threadId.value,
      createdTime: this.createdTime.value,
      lastModifiedTime: this.lastModifiedTime.value,
      sentAt: this.sentAt.value,
      receivedAt: this.receivedAt.value,
      internetMessageId: this.internetMessageId.value,
      subject: this.subject.value,
      sysLabels: this.sysLabels.getValue(),
      keywords: this.keywords.map((keyword) => keyword.value),
      sysClassifications: this.sysClassifications.map((sysClassification) => sysClassification.value),
      sensitivity: this.sensitivity.value,
      meetingMessageMethod: this.meetingMessageMethod.value,
      fromId: this.fromId.toString(),
      hasAttachments: this.hasAttachments.value,
      body: this.body.value,
      bodySnippet: this.bodySnippet.value,
      inReplyTo: this.inReplyTo.value,
      references: this.references.value,
      threadIndex: this.threadIndex.value,
      internetHeaders: this.internetHeaders,
      nativeProperties: this.nativeProperties,
      folderId: this.folderId.value,
      omitted: this.omitted.map((omitted) => omitted.value),
      emailLabel: this.emailLabel.value,
      createdAt: this.createdAt.value,
      updatedAt: this.updatedAt.value,
    };
  }

  static fromPrimitives(data: Primitives<Email>): Email {
    return new Email(
      new StringValueObject(data.id),
      new StringValueObject(data.threadId),
      new DateValueObject(data.createdTime),
      new DateValueObject(data.lastModifiedTime),
      new DateValueObject(data.sentAt),
      new DateValueObject(data.receivedAt),
      new StringValueObject(data.internetMessageId),
      new StringValueObject(data.subject),
      new EmailSysLabels(data.sysLabels),
      data.keywords.map((keyword) => new StringValueObject(keyword)),
      data.sysClassifications.map((sysClassification) => new StringValueObject(sysClassification)),
      new EmailSensitivity(data.sensitivity),
      new StringValueObject(data.meetingMessageMethod),
      new StringValueObject(data.fromId),
      new BooleanValueObject(data.hasAttachments),
      new StringValueObject(data.body),
      new StringValueObject(data.bodySnippet),
      new StringValueObject(data.inReplyTo),
      new StringValueObject(data.references),
      new StringValueObject(data.threadIndex),
      data.internetHeaders,
      data.nativeProperties,
      new StringValueObject(data.folderId),
      data.omitted.map((omitted) => new StringValueObject(omitted)),
      new StringValueObject(data.emailLabel),
      new DateValueObject(data.createdAt),
      new DateValueObject(data.updatedAt),
    );
  }

  static Create(email: EmailMessage, from: string): Email {
    const emailSysLabels = new EmailSysLabels(email.sysLabels);
    return new Email(
      new StringValueObject(email.id),
      new StringValueObject(email.threadId),
      new DateValueObject(email.createdTime),
      new DateValueObject(email.lastModifiedTime),
      new DateValueObject(email.sentAt),
      new DateValueObject(email.receivedAt),
      new StringValueObject(email.internetMessageId),
      new StringValueObject(email.subject),
      emailSysLabels,
      email.keywords.map((keyword) => new StringValueObject(keyword)),
      email.sysClassifications.map((sysClassification) => new StringValueObject(sysClassification)),
      new EmailSensitivity(email.sensitivity as EmailSensitivityValue),
      new StringValueObject(email.meetingMessageMethod!),
      new StringValueObject(from),
      new BooleanValueObject(email.hasAttachments),
      new StringValueObject(email.body!),
      new StringValueObject(email.bodySnippet!),
      new StringValueObject(email.inReplyTo!),
      new StringValueObject(email.references!),
      new StringValueObject(email.threadIndex!),
      email.internetHeaders,
      email.nativeProperties,
      new StringValueObject(email.folderId!),
      email.omitted.map((omitted) => new StringValueObject(omitted)),
      emailSysLabels.getEmailLabelType(),
      DateValueObject.today(),
      DateValueObject.today(),
    );
  }

  static updateFromEmailAddress(name: string, address: string, raw: string, accountId: string) {
    return new EmailAddress(
      Cuid.random(),
      new StringValueObject(name),
      new StringValueObject(address),
      new StringValueObject(raw),
      new Uuid(accountId),
    );
  }

  static setEmailAddressesRelated(
    to: Partial<Primitives<EmailAddress>>[],
    cc: Partial<Primitives<EmailAddress>>[],
    bcc: Partial<Primitives<EmailAddress>>[],
    replyTo: Partial<Primitives<EmailAddress>>[],
    accountId: string,
  ) {
    const addressesToUpsert = new Map();
    for (const address of [...to, ...cc, ...bcc, ...replyTo]) {
      address.accountId = accountId;
      addressesToUpsert.set(address.address, address);
    }

    const toAddresses = to
      .map((address) => addressesToUpsert.get(address.address))
      .filter(Boolean)
      .map((address) => EmailAddress.fromPrimitives(address));

    const ccAddresses = cc
      .map((address) => addressesToUpsert.get(address.address))
      .filter(Boolean)
      .map((address) => EmailAddress.fromPrimitives(address));

    const bccAddresses = bcc
      .map((address) => addressesToUpsert.get(address.address))
      .filter(Boolean)
      .map((address) => EmailAddress.fromPrimitives(address));

    const replyToAddresses = replyTo
      .map((address) => addressesToUpsert.get(address.address))
      .filter(Boolean)
      .map((address) => EmailAddress.fromPrimitives(address));
    return {
      to: toAddresses,
      cc: ccAddresses,
      bcc: bccAddresses,
      replyTo: replyToAddresses,
    };
  }

  static createAttachments(data: Primitives<EmailAttachment>[]) {
    const attachments = data.map((attachment) => EmailAttachment.fromPrimitives(attachment));
    return attachments;
  }
}
