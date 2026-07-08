import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { EventsService } from './events.service';
import { EventGeneratorService } from './generator/event-generator.service';
import { StateModule } from '../state/state.module';

@Module({
    imports: [StateModule], // gives EventsGateway access to StateService
    providers: [EventsGateway, EventsService, EventGeneratorService],
    exports: [EventsService],
})
export class EventsModule {}
