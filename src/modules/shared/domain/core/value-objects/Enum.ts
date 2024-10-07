import { ValueObject } from '../ValueObject';
import { FormatError } from '../errors/FormatError';

export class Enum<T> extends ValueObject<T> {
  constructor(value: T, public readonly validValues: T[]) {
    super(value);
    this.ensureValidValue(value);
  }
  protected validation(value: T): void {
    if (value === null || value === undefined) {
      throw new FormatError('Value string must be defined');
    }
  }

  protected ensureValidValue(value: T): void {
    if (!this.validValues.includes(value)) {
      throw new FormatError(`Invalid value for enum ${this.constructor.name}: ${value}`);
    }
  }

  public getValue(): T {
    return this.value;
  }

  public toString(): string {
    return this.value.toString();
  }
}
