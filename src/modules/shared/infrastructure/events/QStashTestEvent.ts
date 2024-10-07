import { DomainEvent, DomainEventPrimitives } from '@/modules/shared/domain/core/DomainEvent';

export class QStashTestEvent extends DomainEvent {
  static EVENT_NAME = 'test_event';
  constructor(params: { test: string }) {
    super(QStashTestEvent.EVENT_NAME, params);
  }

  public toPrimitive(): DomainEventPrimitives {
    return {
      aggregate: this.aggregate,
      extra_data: {},
      id: this.eventId,
      occurred_on: this.occurredOn.toISOString(),
      type: QStashTestEvent.EVENT_NAME,
    };
  }
  public isPublic(): boolean {
    return true;
  }
}
