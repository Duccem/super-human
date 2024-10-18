import { Aggregate } from '@/modules/shared/domain/core/Aggregate';
import { Cuid } from '@/modules/shared/domain/core/value-objects/Cuid';
import { DateValueObject, NumberValueObject, StringValueObject } from '@/modules/shared/domain/core/ValueObject';
import { Primitives } from '@/modules/shared/domain/types/Primitives';

export class ChatInteraction extends Aggregate {
  constructor(
    id: Cuid,
    public day: StringValueObject,
    public count: NumberValueObject,
    public userId: Cuid,
    updatedAt: DateValueObject,
    createdAt: DateValueObject,
  ) {
    super(id, updatedAt, createdAt);
  }

  toPrimitives(): Primitives<ChatInteraction> {
    return {
      id: this.id.toString(),
      day: this.day.value,
      count: this.count.value,
      userId: this.userId.toString(),
      updatedAt: this.updatedAt.value,
      createdAt: this.createdAt.value,
    };
  }

  static fromPrimitives(plainData: Primitives<ChatInteraction>): ChatInteraction {
    return new ChatInteraction(
      new Cuid(plainData.id),
      new StringValueObject(plainData.day),
      new NumberValueObject(plainData.count),
      new Cuid(plainData.userId),
      new DateValueObject(plainData.updatedAt),
      new DateValueObject(plainData.createdAt),
    );
  }

  static Create(id: string, day: string, count: number, userId: string) {
    return new ChatInteraction(
      new Cuid(id),
      new StringValueObject(day),
      new NumberValueObject(count),
      new Cuid(userId),
      DateValueObject.today(),
      DateValueObject.today(),
    );
  }

  incrementCount() {
    this.count = new NumberValueObject(this.count.value + 1);
  }

  isMaxCount() {
    return this.count.value >= 3;
  }
}
