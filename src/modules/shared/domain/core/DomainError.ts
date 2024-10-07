/**
 * Representation of a domain error that can be thrown by the domain layer.
 */
export class DomainError extends Error {
  protected readonly timestamp: string;
  constructor(message: string) {
    super(message);
    this.timestamp = new Date().toISOString();
  }

  public getMessage(): string {
    return this.message;
  }

  public getTimestamp(): string {
    return this.timestamp;
  }
}
