import { DomainEvent } from './DomainEvent';
import { DateValueObject, StringValueObject } from './ValueObject';

export abstract class Aggregate {
  private domainEvents: Array<DomainEvent>;
  constructor(
    public id: StringValueObject,
    public createdAt: DateValueObject,
    public updatedAt: DateValueObject,
  ) {
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
