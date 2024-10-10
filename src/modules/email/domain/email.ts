import { Aggregate } from '@/modules/shared/domain/core/Aggregate';
import { Uuid } from '@/modules/shared/domain/core/value-objects/Uuid';
import { BooleanValueObject, DateValueObject, StringValueObject } from '@/modules/shared/domain/core/ValueObject';
import { Primitives } from '@/modules/shared/domain/types/Primitives';
import { EmailSensitivity } from './email-sensitivity';

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
    public sysLabels: StringValueObject[],
    public keywords: StringValueObject[],
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
      sysLabels: this.sysLabels.map((label) => label.value),
      keywords: this.keywords.map((keyword) => keyword.value),
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
      data.sysLabels.map((label) => new StringValueObject(label)),
      data.keywords.map((keyword) => new StringValueObject(keyword)),
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
      new DateValueObject(data.createdAt),
      new DateValueObject(data.updatedAt),
    );
  }
}
