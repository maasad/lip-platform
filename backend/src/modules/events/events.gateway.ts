import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { EventsService } from './events.service';
import { StateService } from '../state/state.service';
import { EventDto } from './dto/event.dto';

@WebSocketGateway({
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
    },
    namespace: '/events',
})
export class EventsGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(EventsGateway.name);

    constructor(
        private readonly eventsService: EventsService,
        private readonly stateService: StateService, // injected from StateModule
    ) {}

    afterInit() {
        this.logger.log('WebSocket Gateway initialized on namespace /events');
    }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
        const recentEvents = this.eventsService.getRecentEvents(20);
        client.emit('recent_events', recentEvents);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    /**
     * Broadcasts event to all clients AND triggers state mutation.
     * This is the single entry point for all event processing.
     */
    async broadcastEvent(event: EventDto): Promise<void> {
        // Store in ring buffer and log
        this.eventsService.addEvent(event);

        // Mutate the Redis state machine
        // We do not await this in a blocking way - fire and continue
        this.stateService.processEvent(event).catch((err: Error) => {
            this.logger.error(`State processing failed: ${err.message}`);
        });

        // Broadcast to all WebSocket clients
        this.server.emit('new_event', event);
    }

    @SubscribeMessage('ping')
    handlePing(client: Socket): void {
        client.emit('pong', { timestamp: Date.now() });
    }
}
