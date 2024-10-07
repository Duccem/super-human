import { DomainError } from '../DomainError';

/**
 * Representation of a domain error that can be thrown when not mapped error ocurred.
 */
export class InternalError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
