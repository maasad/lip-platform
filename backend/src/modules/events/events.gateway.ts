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
import { EventDto } from './dto/event.dto';

// @WebSocketGateway decorator registers this class as a WebSocket server
// cors allows our React frontend to connect
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/events', // WebSocket clients connect to ws://localhost:3000/events
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  // @WebSocketServer injects the raw Socket.io server instance
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(private readonly eventsService: EventsService) {}

  // Runs once when the WebSocket server initializes
  afterInit() {
    this.logger.log('WebSocket Gateway initialized on namespace /events');
  }

  // Runs every time a client connects
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    // Send the last 20 events to the newly connected client
    // so their UI is not empty on first load
    const recentEvents = this.eventsService.getRecentEvents(20);
    client.emit('recent_events', recentEvents);
  }

  // Runs every time a client disconnects
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Broadcasts a new event to ALL connected clients.
   * Called by the event generator service every time it produces an event.
   */
  broadcastEvent(event: EventDto): void {
    this.eventsService.addEvent(event);
    this.server.emit('new_event', event);
  }

  /**
   * Handles a ping message from any client.
   * Useful for connection health checks from the frontend.
   */
  @SubscribeMessage('ping')
  handlePing(client: Socket): void {
    client.emit('pong', { timestamp: Date.now() });
  }
}
