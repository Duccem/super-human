import { Aggregate } from '@/modules/shared/domain/core/Aggregate';
import { Uuid } from '@/modules/shared/domain/core/value-objects/Uuid';
import { BooleanValueObject, DateValueObject, StringValueObject } from '@/modules/shared/domain/core/ValueObject';
import { Primitives } from '@/modules/shared/domain/types/Primitives';
import { EmailAddress } from './email-address';
import { EmailAttachment } from './email-attachment';
import { EmailSensitivity, EmailSensitivityValue } from './email-sensitivity';
import { EmailSysLabels } from './email-syslabels';

export class Email extends Aggregate {
  constructor(
    id: Uuid,
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
    public fromId: Uuid,
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
      new Uuid(data.id),
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
      new Uuid(data.fromId),
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

  static Create(
    id: string,
    threadId: string,
    createdTime: string,
    lastModifiedTime: string,
    sentAt: string,
    receivedAt: string,
    internetMessageId: string,
    subject: string,
    sysLabels: Array<'junk' | 'trash' | 'sent' | 'inbox' | 'unread' | 'flagged' | 'important' | 'draft'>,
    keywords: string[],
    sysClassifications: Array<'personal' | 'social' | 'promotions' | 'updates' | 'forums'>,
    sensitivity: EmailSensitivityValue,
    meetingMessageMethod: 'request' | 'reply' | 'cancel' | 'counter' | 'other',
    fromId: string,
    hasAttachments: boolean,
    body: string,
    bodySnippet: string,
    inReplyTo: string,
    references: string,
    threadIndex: string,
    internetHeaders: any[],
    nativeProperties: Record<string, any>,
    folderId: string,
    omitted: Array<'threadId' | 'body' | 'attachments' | 'recipients' | 'internetHeaders'>,
  ): Email {
    const emailSysLabels = new EmailSysLabels(sysLabels);
    return new Email(
      new Uuid(id),
      new StringValueObject(threadId),
      new DateValueObject(createdTime),
      new DateValueObject(lastModifiedTime),
      new DateValueObject(sentAt),
      new DateValueObject(receivedAt),
      new StringValueObject(internetMessageId),
      new StringValueObject(subject),
      emailSysLabels,
      keywords.map((keyword) => new StringValueObject(keyword)),
      sysClassifications.map((sysClassification) => new StringValueObject(sysClassification)),
      new EmailSensitivity(sensitivity),
      new StringValueObject(meetingMessageMethod),
      new Uuid(fromId),
      new BooleanValueObject(hasAttachments),
      new StringValueObject(body),
      new StringValueObject(bodySnippet),
      new StringValueObject(inReplyTo),
      new StringValueObject(references),
      new StringValueObject(threadIndex),
      internetHeaders,
      nativeProperties,
      new StringValueObject(folderId),
      omitted.map((omitted) => new StringValueObject(omitted)),
      emailSysLabels.getEmailLabelType(),
      DateValueObject.today(),
      DateValueObject.today(),
    );
  }

  static updateFromEmailAddress(name: string, address: string, raw: string, accountId: string) {
    return new EmailAddress(
      Uuid.random(),
      new StringValueObject(name),
      new StringValueObject(address),
      new StringValueObject(raw),
      new Uuid(accountId),
    );
  }

  private toAddresses: EmailAddress[] = [];
  private ccAddresses: EmailAddress[] = [];
  private bccAddresses: EmailAddress[] = [];
  private replyToAddresses: EmailAddress[] = [];

  setEmailAddressesRelated(
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

    this.toAddresses = to
      .map((address) => addressesToUpsert.get(address.address))
      .filter(Boolean)
      .map((address) => EmailAddress.fromPrimitives(address));

    this.ccAddresses = cc
      .map((address) => addressesToUpsert.get(address.address))
      .filter(Boolean)
      .map((address) => EmailAddress.fromPrimitives(address));

    this.bccAddresses = bcc
      .map((address) => addressesToUpsert.get(address.address))
      .filter(Boolean)
      .map((address) => EmailAddress.fromPrimitives(address));

    this.replyToAddresses = replyTo
      .map((address) => addressesToUpsert.get(address.address))
      .filter(Boolean)
      .map((address) => EmailAddress.fromPrimitives(address));
  }

  getEmailAddressesRelated() {
    return {
      to: this.toAddresses,
      cc: this.ccAddresses,
      bcc: this.bccAddresses,
      replyTo: this.replyToAddresses,
    };
  }

  private attachments: EmailAttachment[] = [];
  setAttachments(attachments: Primitives<EmailAttachment>[]) {
    this.attachments = attachments.map((attachment) => EmailAttachment.fromPrimitives(attachment));
  }

  getAttachments() {
    return this.attachments;
  }
}
