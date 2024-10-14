import { Aggregate } from '@/modules/shared/domain/core/Aggregate';
import { Cuid } from '@/modules/shared/domain/core/value-objects/Cuid';
import {
  BooleanValueObject,
  DateValueObject,
  OptionalDate,
  OptionalString,
  StringValueObject,
} from '@/modules/shared/domain/core/ValueObject';
import { Primitives } from '@/modules/shared/domain/types/Primitives';
import { EmailAddress, EmailAddressName, EmailAddressRaw } from './email-address';
import { EmailAttachment } from './email-attachment';
import { EmailSensitivity, EmailSensitivityValue } from './email-sensitivity';
import { EmailMessage } from './email-service';
import { EmailSysLabels } from './email-syslabels';

export class Email extends Aggregate {
  constructor(
    id: StringValueObject,
    public threadId: StringValueObject,
    public createdTime: DateValueObject,
    public lastModifiedTime: OptionalDate,
    public sentAt: DateValueObject,
    public receivedAt: DateValueObject,
    public internetMessageId: StringValueObject,
    public subject: StringValueObject,
    public sysLabels: EmailSysLabels,
    public keywords: StringValueObject[],
    public sysClassifications: StringValueObject[],
    public sensitivity: EmailSensitivity,
    public meetingMessageMethod: OptionalString,
    public fromId: StringValueObject,
    public hasAttachments: BooleanValueObject,
    public body: OptionalString,
    public bodySnippet: OptionalString,
    public inReplyTo: OptionalString,
    public references: OptionalString,
    public threadIndex: OptionalString,
    public internetHeaders: any[],
    public nativeProperties: Record<string, any>,
    public folderId: OptionalString,
    public omitted: StringValueObject[],
    public emailLabel: StringValueObject,
    createdAt: DateValueObject,
    updatedAt: DateValueObject,
    public from?: EmailAddress,
    public to?: EmailAddress[],
    public cc?: EmailAddress[],
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
      from: this.from ? this.from.toPrimitives() : undefined,
      to: this.to ? this.to.map((to) => to.toPrimitives()) : undefined,
      cc: this.cc ? this.cc.map((cc) => cc.toPrimitives()) : undefined,
    };
  }

  static fromPrimitives(data: Primitives<Email>): Email {
    return new Email(
      new StringValueObject(data.id),
      new StringValueObject(data.threadId),
      new DateValueObject(data.createdTime),
      new OptionalDate(data.lastModifiedTime),
      new DateValueObject(data.sentAt),
      new DateValueObject(data.receivedAt),
      new StringValueObject(data.internetMessageId),
      new StringValueObject(data.subject),
      new EmailSysLabels(data.sysLabels),
      data.keywords.map((keyword) => new StringValueObject(keyword)),
      data.sysClassifications.map((sysClassification) => new StringValueObject(sysClassification)),
      new EmailSensitivity(data.sensitivity),
      new OptionalString(data.meetingMessageMethod),
      new StringValueObject(data.fromId),
      new BooleanValueObject(data.hasAttachments),
      new OptionalString(data.body),
      new OptionalString(data.bodySnippet),
      new OptionalString(data.inReplyTo),
      new OptionalString(data.references),
      new OptionalString(data.threadIndex),
      data.internetHeaders,
      data.nativeProperties,
      new OptionalString(data.folderId),
      data.omitted.map((omitted) => new StringValueObject(omitted)),
      new StringValueObject(data.emailLabel),
      new DateValueObject(data.createdAt),
      new DateValueObject(data.updatedAt),
      data.from ? EmailAddress.fromPrimitives(data.from) : undefined,
      data.to ? data.to.map((to) => EmailAddress.fromPrimitives(to)) : undefined,
      data.cc ? data.cc.map((cc) => EmailAddress.fromPrimitives(cc)) : undefined,
    );
  }

  static Create(email: EmailMessage, from: string): Email {
    const emailSysLabels = new EmailSysLabels(email.sysLabels);
    return new Email(
      new StringValueObject(email.id),
      new StringValueObject(email.threadId),
      new DateValueObject(email.createdTime),
      new OptionalDate(email.lastModifiedTime),
      new DateValueObject(email.sentAt),
      new DateValueObject(email.receivedAt),
      new StringValueObject(email.internetMessageId),
      new StringValueObject(email.subject),
      emailSysLabels,
      email.keywords.map((keyword) => new StringValueObject(keyword)),
      email.sysClassifications.map((sysClassification) => new StringValueObject(sysClassification)),
      new EmailSensitivity(email.sensitivity as EmailSensitivityValue),
      new OptionalString(email.meetingMessageMethod!),
      new StringValueObject(from),
      new BooleanValueObject(email.hasAttachments),
      new OptionalString(email.body!),
      new OptionalString(email.bodySnippet!),
      new OptionalString(email.inReplyTo!),
      new OptionalString(email.references!),
      new OptionalString(email.threadIndex!),
      email.internetHeaders,
      email.nativeProperties,
      new OptionalString(email.folderId!),
      email.omitted.map((omitted) => new StringValueObject(omitted)),
      emailSysLabels.getEmailLabelType(),
      DateValueObject.today(),
      DateValueObject.today(),
    );
  }

  static updateFromEmailAddress(name: string, address: string, raw: string, accountId: string) {
    return new EmailAddress(
      Cuid.random(),
      new EmailAddressName(name),
      new StringValueObject(address),
      new EmailAddressRaw(raw),
      new StringValueObject(accountId),
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
      .map((address) => EmailAddress.fromPrimitives({ ...address, id: Cuid.random().toString() }));

    const ccAddresses = cc
      .map((address) => addressesToUpsert.get(address.address))
      .filter(Boolean)
      .map((address) => EmailAddress.fromPrimitives({ ...address, id: Cuid.random().toString() }));

    const bccAddresses = bcc
      .map((address) => addressesToUpsert.get(address.address))
      .filter(Boolean)
      .map((address) => EmailAddress.fromPrimitives({ ...address, id: Cuid.random().toString() }));

    const replyToAddresses = replyTo
      .map((address) => addressesToUpsert.get(address.address))
      .filter(Boolean)
      .map((address) => EmailAddress.fromPrimitives({ ...address, id: Cuid.random().toString() }));
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
