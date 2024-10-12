import { Cuid } from '@/modules/shared/domain/core/value-objects/Cuid';
import { StringValueObject, ValueObject } from '@/modules/shared/domain/core/ValueObject';
import { Primitives } from '@/modules/shared/domain/types/Primitives';

export class EmailAddress {
  constructor(
    public id: Cuid,
    public name: EmailAddressName,
    public address: StringValueObject,
    public raw: EmailAddressRaw,
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
      new Cuid(primitives.id),
      new EmailAddressName(primitives.name),
      new StringValueObject(primitives.address),
      new EmailAddressRaw(primitives.raw),
      new StringValueObject(primitives.accountId),
    );
  }

  static Create(id: string, name: string, address: string, raw: string, accountId: string): EmailAddress {
    return new EmailAddress(
      new Cuid(id),
      new EmailAddressName(name),
      new StringValueObject(address),
      new EmailAddressRaw(raw),
      new StringValueObject(accountId),
    );
  }

  setId(id: string): void {
    this.id = new Cuid(id);
  }
}

export class EmailAddressName extends ValueObject<string | undefined> {
  protected validation(value: string | undefined): void {
    return;
  }
}

export class EmailAddressRaw extends ValueObject<string | undefined> {
  protected validation(value: string): void {
    return;
  }
}
