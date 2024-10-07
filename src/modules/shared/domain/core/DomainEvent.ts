import { Uuid } from './value-objects/Uuid';

export type DomainEventPrimitives = {
  aggregate: Record<string, unknown>;
  id: string;
  occurred_on: string;
  type: string;
  extra_data: Record<string, unknown>;
};

/**
 * @name DomainEvent
 * @description DomainEvent is an abstract class that represents a domain event. this DTO is used to represent an event that has happened in the domain.
 * @param {string} eventName - The name of the event.
 * @param {string} aggregateId - The id of the aggregate that the event belongs to.
 * @param {string} eventId - The id of the event.
 * @param {Date} occurredOn - The date when the event occurred.
 */
export abstract class DomainEvent {
  static EVENT_NAME: string;
  static fromPrimitives: (params: any) => DomainEvent;
  readonly aggregate: Record<string, unknown>;
  readonly eventId: string;
  readonly occurredOn: Date;
  readonly eventName: string;
  readonly extraData: Record<string, unknown>;

  constructor(
    eventName: string,
    aggregate: Record<string, unknown>,
    eventId?: string,
    occurredOn?: Date,
    extraData?: Record<string, unknown>,
  ) {
    this.aggregate = aggregate;
    this.eventId = eventId || Uuid.random().value;
    this.occurredOn = occurredOn || new Date();
    this.eventName = eventName;
    this.extraData = extraData || {};
  }

  public abstract toPrimitive(): DomainEventPrimitives;
  public abstract isPublic(): boolean;
}

/**
 * @name DomainEventClass
 * @description DomainEventClass is an interface that represents a domain event class. this interface is used to represent a domain event class.
 */
export type DomainEventClass = { EVENT_NAME: string; fromPrimitives(params: any): DomainEvent };

/**
 * @name EventBus
 * @description EventBus is an interface that represents an event bus. Used to publish domain events.
 */
export interface EventBus {
  publish(events: Array<DomainEvent>): Promise<void>;
}

/**
 * @name DomainEventSubscriber
 * @description DomainEventSubscriber is an interface that represents a domain event subscriber. Used to subscribe to domain events.
 */
export interface DomainEventSubscriber {
  /**
   * @name subscribedTo
   * @description Returns an array of domain events that the subscriber is subscribed to.
   */
  subscribedTo(): Array<DomainEventClass>;

  /**
   * @name on
   * @description Handles the domain event.
   * @param {DomainEvent} domainEvent - The domain event to handle.
   */
  on(domainEvent: DomainEvent): Promise<void>;

  /**
   * @name name
   * @description Returns the name of the subscriber. to build the queue name.
   */
  name(): string;
}
