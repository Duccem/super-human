import { FormatError } from './errors/FormatError';
export abstract class ValueObject<T> {
  public value: T;
  constructor(value: T) {
    this.validation(value);
    this.value = value;
  }

  equals(other: ValueObject<T>): boolean {
    return other.constructor.name === this.constructor.name && other.value === this.value;
  }

  toString(): string {
    return this.value.toString();
  }

  getValue(): T {
    return this.value;
  }

  protected abstract validation(value: T): void;
}

export class BooleanValueObject extends ValueObject<boolean> {
  constructor(value: boolean) {
    super(value);
  }
  public validation(value: boolean): void {
    if (typeof value !== 'boolean') throw new Error(`${value} is not a valid boolean`);
  }
}

export class DateValueObject extends ValueObject<Date> {
  constructor(value: string | number | Date) {
    super(typeof value === 'string' && !value.includes('-') ? new Date(Number(value)) : new Date(value));
  }

  public validation(value: Date): void {
    if (new Date(value).toString() === 'Invalid Date') throw new FormatError(`${value} is not a valid date`);
  }

  public static today(): DateValueObject {
    return new DateValueObject(new Date());
  }
}

export class NumberValueObject extends ValueObject<number> {
  public validation(value: number): void {
    if (value === null || value === undefined) {
      throw new FormatError('Value number must be defined');
    }
  }

  public static zero(): NumberValueObject {
    return new NumberValueObject(0);
  }
}

export class StringValueObject extends ValueObject<string> {
  protected validation(value: string): void {
    if (value === null || value === undefined) {
      throw new FormatError('Value string must be defined');
    }
  }

  public static Empty(): StringValueObject {
    return new StringValueObject('');
  }
}
