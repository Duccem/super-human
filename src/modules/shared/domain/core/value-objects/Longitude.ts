import { NumberValueObject } from '../ValueObject';
import { FormatError } from '../errors/FormatError';

export class Longitude extends NumberValueObject {
  public validate(value: number): void {
    super.validation(value);
    if (value > 180 && value < -180) {
      throw new FormatError('Longitude out of boundaries');
    }
  }
}
