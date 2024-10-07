import { DomainError } from '../DomainError';

/**
 * Representation of a domain error that can be thrown when the user is not authorized.
 */
export class PermissionsError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
