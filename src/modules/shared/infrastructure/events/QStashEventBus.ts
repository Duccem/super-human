import { Client } from '@upstash/qstash';
import { DomainEvent, EventBus } from '@/modules/shared/domain/core/DomainEvent';

export class QStashEventBus implements EventBus {
  constructor(private readonly qstashClient: Client) {}
  async publish(events: DomainEvent[]): Promise<void> {
    const publishedEvents = [];
    for (const event of events) {
      const publishedEvent = this.qstashClient.publishJSON({
        url: `${process.env.QSTASH_APP_URL}/api/webhooks/events/${event.eventName}`,
        body: event.toPrimitive(),
      });
      publishedEvents.push(publishedEvent);
    }
    await Promise.all(publishedEvents);
  }
}
