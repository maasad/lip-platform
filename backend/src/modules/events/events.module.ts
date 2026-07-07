import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { EventsService } from './events.service';
import { EventGeneratorService } from './generator/event-generator.service';

@Module({
  providers: [
    EventsGateway, // WebSocket server
    EventsService, // Business logic and in-memory storage
    EventGeneratorService, // Synthetic event generator
  ],
  exports: [EventsService], // Other modules can inject EventsService
})
export class EventsModule {}
