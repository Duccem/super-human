import { DomainError } from '../DomainError';

/**
 * Representation of a domain error that can be thrown when the format of a value is invalid.
 */
export class FormatError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
