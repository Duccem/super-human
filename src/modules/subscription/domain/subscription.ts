import { Aggregate } from '@/modules/shared/domain/core/Aggregate';
import { Cuid } from '@/modules/shared/domain/core/value-objects/Cuid';
import { DateValueObject, StringValueObject } from '@/modules/shared/domain/core/ValueObject';
import { Primitives } from '@/modules/shared/domain/types/Primitives';

export class Subscription extends Aggregate {
  constructor(
    id: Cuid,
    public subscriptionId: StringValueObject,
    public userId: StringValueObject,
    public productId: StringValueObject,
    public priceId: StringValueObject,
    public customerId: StringValueObject,
    public currentPeriodEnd: DateValueObject,
    createdAt: DateValueObject,
    updatedAt: DateValueObject,
  ) {
    super(id, createdAt, updatedAt);
  }

  toPrimitives(): Primitives<Subscription> {
    return {
      id: this.id.value,
      subscriptionId: this.subscriptionId.value,
      userId: this.userId.value,
      productId: this.productId.value,
      priceId: this.priceId.value,
      customerId: this.customerId.value,
      currentPeriodEnd: this.currentPeriodEnd.value,
      createdAt: this.createdAt.value,
      updatedAt: this.updatedAt.value,
    };
  }

  static fromPrimitives(subscription: Primitives<Subscription>): Subscription {
    return new Subscription(
      new Cuid(subscription.id),
      new StringValueObject(subscription.subscriptionId),
      new StringValueObject(subscription.userId),
      new StringValueObject(subscription.productId),
      new StringValueObject(subscription.priceId),
      new StringValueObject(subscription.customerId),
      new DateValueObject(subscription.currentPeriodEnd),
      new DateValueObject(subscription.createdAt),
      new DateValueObject(subscription.updatedAt),
    );
  }

  static Create(
    id: string,
    subscriptionId: string,
    userId: string,
    productId: string,
    priceId: string,
    customerId: string,
    currentPeriodEnd: Date,
  ): Subscription {
    return new Subscription(
      new Cuid(id),
      new StringValueObject(subscriptionId),
      new StringValueObject(userId),
      new StringValueObject(productId),
      new StringValueObject(priceId),
      new StringValueObject(customerId),
      new DateValueObject(currentPeriodEnd),
      DateValueObject.today(),
      DateValueObject.today(),
    );
  }

  isActive(): boolean {
    return this.currentPeriodEnd.value.getTime() > Date.now();
  }
}
