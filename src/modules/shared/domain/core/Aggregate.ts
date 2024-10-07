import { DomainEvent } from './DomainEvent';

export abstract class Aggregate {
  private domainEvents: Array<DomainEvent>;
  constructor(public id: string, public createdAt: Date, public updatedAt: Date) {
    this.domainEvents = [];
  }

  public pullDomainEvents(): Array<DomainEvent> {
    const domainEvents = this.domainEvents.slice();
    this.domainEvents = [];
    return domainEvents;
  }

  public record(event: DomainEvent): void {
    this.domainEvents.push(event);
  }
}
