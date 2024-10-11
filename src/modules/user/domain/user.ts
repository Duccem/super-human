import { Aggregate } from '@/modules/shared/domain/core/Aggregate';
import { Uuid } from '@/modules/shared/domain/core/value-objects/Uuid';
import { DateValueObject, StringValueObject } from '@/modules/shared/domain/core/ValueObject';
import { Primitives } from '@/modules/shared/domain/types/Primitives';

export class User extends Aggregate {
  constructor(
    id: StringValueObject,
    public emailAddress: StringValueObject,
    public firstName: StringValueObject,
    public lastName: StringValueObject,
    public imageUrl: StringValueObject,
    createdAt: DateValueObject,
    updatedAt: DateValueObject,
  ) {
    super(id, createdAt, updatedAt);
  }

  toPrimitives(): Primitives<User> {
    return {
      id: this.id.value,
      emailAddress: this.emailAddress.value,
      firstName: this.firstName.value,
      lastName: this.lastName.value,
      imageUrl: this.imageUrl.value,
      createdAt: this.createdAt.value,
      updatedAt: this.updatedAt.value,
    };
  }

  static fromPrimitives(primitives: Primitives<User>): User {
    return new User(
      new Uuid(primitives.id),
      new StringValueObject(primitives.emailAddress),
      new StringValueObject(primitives.firstName),
      new StringValueObject(primitives.lastName),
      new StringValueObject(primitives.imageUrl),
      new DateValueObject(primitives.createdAt),
      new DateValueObject(primitives.updatedAt),
    );
  }

  static Create(id: string, emailAddress: string, firstName: string, lastName: string, imageUrl: string): User {
    return new User(
      new StringValueObject(id),
      new StringValueObject(emailAddress),
      new StringValueObject(firstName),
      new StringValueObject(lastName),
      new StringValueObject(imageUrl),
      DateValueObject.today(),
      DateValueObject.today(),
    );
  }
}
