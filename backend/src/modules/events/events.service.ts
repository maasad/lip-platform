import { Injectable, Logger } from '@nestjs/common';
import { EventDto } from './dto/event.dto';

@Injectable()
export class EventsService {
  // NestJS built-in logger - scoped to this service
  private readonly logger = new Logger(EventsService.name);

  // In-memory ring buffer of the last 100 events
  // We use an array capped at MAX_EVENTS to avoid unbounded memory growth
  private readonly events: EventDto[] = [];
  private readonly MAX_EVENTS = 100;

  /**
   * Stores an incoming event and returns it.
   * Called by the gateway every time a new event arrives.
   */
  addEvent(event: EventDto): EventDto {
    this.events.push(event);

    // If we exceed the cap, remove the oldest event
    if (this.events.length > this.MAX_EVENTS) {
      this.events.shift();
    }

    this.logger.log(`Event received: ${event.type} [${event.severity}]`);
    return event;
  }

  /**
   * Returns the most recent N events.
   * Used when a new client connects and needs to catch up.
   */
  getRecentEvents(limit = 20): EventDto[] {
    return this.events.slice(-limit);
  }

  /**
   * Returns total count of events processed since startup.
   * Used by the health check and state snapshot.
   */
  getEventCount(): number {
    return this.events.length;
  }
}
