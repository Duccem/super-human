import { Uuid } from '@/modules/shared/domain/core/value-objects/Uuid';
import { StringValueObject } from '@/modules/shared/domain/core/ValueObject';
import { Primitives } from '@/modules/shared/domain/types/Primitives';

export class EmailAddress {
  constructor(
    public id: Uuid,
    public name: StringValueObject,
    public address: StringValueObject,
    public raw: StringValueObject,
    public accountId: StringValueObject,
  ) {}

  public toPrimitives(): Primitives<EmailAddress> {
    return {
      id: this.id.toString(),
      name: this.name.value,
      address: this.address.value,
      raw: this.raw.value,
      accountId: this.accountId.value,
    };
  }

  static fromPrimitives(primitives: Primitives<EmailAddress>): EmailAddress {
    return new EmailAddress(
      new Uuid(primitives.id),
      new StringValueObject(primitives.name),
      new StringValueObject(primitives.address),
      new StringValueObject(primitives.raw),
      new StringValueObject(primitives.accountId),
    );
  }

  static Create(id: string, name: string, address: string, raw: string, accountId: string): EmailAddress {
    return new EmailAddress(
      new Uuid(id),
      new StringValueObject(name),
      new StringValueObject(address),
      new StringValueObject(raw),
      new StringValueObject(accountId),
    );
  }

  setId(id: string): void {
    this.id = new Uuid(id);
  }
}
