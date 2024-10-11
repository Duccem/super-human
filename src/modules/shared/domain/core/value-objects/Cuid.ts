import { createId, isCuid } from '@paralleldrive/cuid2';
import { StringValueObject } from '../ValueObject';
import { FormatError } from '../errors/FormatError';

export class Cuid extends StringValueObject {
  constructor(value: string) {
    super(value);
  }
  public static random(): Cuid {
    return new Cuid(createId());
  }

  public static validateID(id: string): boolean {
    if (!isCuid(id)) return false;
    return true;
  }

  protected validation(id: string): void {
    super.validation(id);
    if (!isCuid(id)) {
      throw new FormatError(`<${Cuid.name}> does not allow the value <${id}>`);
    }
  }

  public toString(): string {
    return this.value.toString();
  }
}
