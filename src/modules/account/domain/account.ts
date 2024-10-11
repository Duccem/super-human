import { Aggregate } from '@/modules/shared/domain/core/Aggregate';
import { DateValueObject, StringValueObject } from '@/modules/shared/domain/core/ValueObject';
import { Primitives } from '@/modules/shared/domain/types/Primitives';
import { AccountCreated } from './account-created-event';

export class Account extends Aggregate {
  constructor(
    id: StringValueObject,
    public userId: StringValueObject,
    public nextDeltaToken: StringValueObject,
    public accessToken: StringValueObject,
    public emailAddress: StringValueObject,
    public name: StringValueObject,
    createdAt: DateValueObject,
    updatedAt: DateValueObject,
  ) {
    super(id, createdAt, updatedAt);
  }

  toPrimitives(): Primitives<Account> {
    return {
      id: this.id.toString(),
      userId: this.userId.toString(),
      nextDeltaToken: this.nextDeltaToken.value,
      accessToken: this.accessToken.value,
      emailAddress: this.emailAddress.value,
      name: this.name.value,
      createdAt: this.createdAt.value,
      updatedAt: this.updatedAt.value,
    };
  }

  static fromPrimitives(data: Primitives<Account>): Account {
    return new Account(
      new StringValueObject(data.id),
      new StringValueObject(data.userId),
      new StringValueObject(data.nextDeltaToken),
      new StringValueObject(data.accessToken),
      new StringValueObject(data.emailAddress),
      new StringValueObject(data.name),
      new DateValueObject(data.createdAt),
      new DateValueObject(data.updatedAt),
    );
  }
  static Create(
    id: string,
    userId: string,
    nextDeltaToken: string,
    accessToken: string,
    emailAddress: string,
    name: string,
  ) {
    const account = new Account(
      new StringValueObject(id),
      new StringValueObject(userId),
      new StringValueObject(nextDeltaToken),
      new StringValueObject(accessToken),
      new StringValueObject(emailAddress),
      new StringValueObject(name),
      DateValueObject.today(),
      DateValueObject.today(),
    );
    account.record(new AccountCreated({ aggregate: account.toPrimitives() }));
    return account;
  }

  updateDeltaToken(deltaToken: string) {
    this.nextDeltaToken = new StringValueObject(deltaToken);
  }
}
