import { DomainEvent } from './DomainEvent';
import { Uuid } from './value-objects/Uuid';
import { DateValueObject } from './ValueObject';

export abstract class Aggregate {
  private domainEvents: Array<DomainEvent>;
  constructor(
    public id: Uuid,
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
