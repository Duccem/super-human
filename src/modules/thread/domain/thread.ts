import { Aggregate } from '@/modules/shared/domain/core/Aggregate';
import { Uuid } from '@/modules/shared/domain/core/value-objects/Uuid';
import { BooleanValueObject, DateValueObject, StringValueObject } from '@/modules/shared/domain/core/ValueObject';
import { Primitives } from '@/modules/shared/domain/types/Primitives';

export class Thread extends Aggregate {
  constructor(
    id: Uuid,
    public subject: StringValueObject,
    public lastMessageDate: DateValueObject,
    public participantIds: StringValueObject[],
    public accountId: StringValueObject,
    public done: BooleanValueObject,
    public inboxStatus: BooleanValueObject,
    public draftStatus: BooleanValueObject,
    public sentStatus: BooleanValueObject,
    createdAt: DateValueObject,
    updatedAt: DateValueObject,
  ) {
    super(id, createdAt, updatedAt);
  }

  toPrimitives(): Primitives<Thread> {
    return {
      id: this.id.toString(),
      subject: this.subject.value,
      lastMessageDate: this.lastMessageDate.value,
      participantIds: this.participantIds.map((id) => id.value),
      accountId: this.accountId.value,
      done: this.done.value,
      inboxStatus: this.inboxStatus.value,
      draftStatus: this.draftStatus.value,
      sentStatus: this.sentStatus.value,
      createdAt: this.createdAt.value,
      updatedAt: this.updatedAt.value,
    };
  }

  static fromPrimitives(data: Primitives<Thread>): Thread {
    return new Thread(
      new Uuid(data.id),
      new StringValueObject(data.subject),
      new DateValueObject(data.lastMessageDate),
      data.participantIds.map((id) => new StringValueObject(id)),
      new StringValueObject(data.accountId),
      new BooleanValueObject(data.done),
      new BooleanValueObject(data.inboxStatus),
      new BooleanValueObject(data.draftStatus),
      new BooleanValueObject(data.sentStatus),
      new DateValueObject(data.createdAt),
      new DateValueObject(data.updatedAt),
    );
  }

  static Create(
    id: string,
    subject: string,
    lastMessageDate: Date,
    participantIds: string[],
    accountId: string,
    done: boolean,
    inboxStatus: boolean,
    draftStatus: boolean,
    sentStatus: boolean,
  ) {
    const thread = new Thread(
      new Uuid(id),
      new StringValueObject(subject),
      new DateValueObject(lastMessageDate),
      participantIds.map((id) => new StringValueObject(id)),
      new StringValueObject(accountId),
      new BooleanValueObject(done),
      new BooleanValueObject(inboxStatus),
      new BooleanValueObject(draftStatus),
      new BooleanValueObject(sentStatus),
      DateValueObject.today(),
      DateValueObject.today(),
    );
    return thread;
  }
}
