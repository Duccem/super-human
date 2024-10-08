import { DomainEvent, DomainEventPrimitives } from '@/modules/shared/domain/core/DomainEvent';

export class AccountCreated extends DomainEvent {
  static readonly EVENT_NAME: string = 'account-created-event';
  constructor({
    aggregate,
    extraData,
    eventId,
    ocurredOn,
  }: {
    aggregate: Record<string, unknown>; // Change to the aggregate primitive
    extraData?: Record<string, unknown>;
    eventId?: string;
    ocurredOn?: Date;
  }) {
    super(AccountCreated.EVENT_NAME, aggregate, eventId, ocurredOn, extraData);
  }
  toPrimitive(): DomainEventPrimitives {
    return {
      aggregate: this.aggregate,
      id: this.eventId,
      extra_data: {},
      occurred_on: this.occurredOn.toString(),
      type: AccountCreated.EVENT_NAME,
    };
  }
  static fromPrimitives(data: DomainEventPrimitives): AccountCreated {
    return new AccountCreated(data);
  }
  isPublic(): boolean {
    return false;
  }
}
