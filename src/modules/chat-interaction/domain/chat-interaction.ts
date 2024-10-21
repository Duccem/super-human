import { Aggregate } from '@/modules/shared/domain/core/Aggregate';
import { DateValueObject, NumberValueObject, StringValueObject } from '@/modules/shared/domain/core/ValueObject';
import { Primitives } from '@/modules/shared/domain/types/Primitives';
import { MaxInteractions } from './max-interactions';

export class ChatInteraction extends Aggregate {
  constructor(
    id: StringValueObject,
    public day: StringValueObject,
    public count: NumberValueObject,
    public userId: StringValueObject,
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
      new StringValueObject(plainData.id),
      new StringValueObject(plainData.day),
      new NumberValueObject(plainData.count),
      new StringValueObject(plainData.userId),
      new DateValueObject(plainData.updatedAt),
      new DateValueObject(plainData.createdAt),
    );
  }

  static Create(id: string, day: string, count: number, userId: string) {
    return new ChatInteraction(
      new StringValueObject(id),
      new StringValueObject(day),
      new NumberValueObject(count),
      new StringValueObject(userId),
      DateValueObject.today(),
      DateValueObject.today(),
    );
  }

  incrementCount() {
    this.count = new NumberValueObject(this.count.value + 1);
  }

  isMaxCount() {
    return this.count.value >= MaxInteractions.MAX_INTERACTIONS;
  }

  getRemainingInteractions() {
    return MaxInteractions.MAX_INTERACTIONS - (this.count.value || 0);
  }
}
