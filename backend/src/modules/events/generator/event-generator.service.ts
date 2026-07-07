import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { EventsGateway } from '../events.gateway';
import { EventDto, EventType, EventSeverity } from '../dto/event.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class EventGeneratorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventGeneratorService.name);
  private intervalRef!: NodeJS.Timeout;

  // How often we fire a new event (milliseconds)
  private readonly INTERVAL_MS = 2000;

  constructor(private readonly eventsGateway: EventsGateway) {}

  // OnModuleInit runs automatically when NestJS finishes loading this module
  onModuleInit() {
    this.logger.log('Starting synthetic event generator...');
    this.intervalRef = setInterval(() => {
      const event = this.generateEvent();
      this.eventsGateway.broadcastEvent(event);
    }, this.INTERVAL_MS);
  }

  // OnModuleDestroy runs when the app shuts down - cleans up the interval
  onModuleDestroy() {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
      this.logger.log('Synthetic event generator stopped');
    }
  }

  /**
   * Generates a single realistic fintech event.
   * Each call randomly picks an event type and builds a
   * realistic payload matching what that event type would carry.
   */
  private generateEvent(): EventDto {
    const eventType = this.randomEventType();
    const correlationId = randomUUID();

    return {
      id: randomUUID(),
      type: eventType,
      severity: this.severityForType(eventType),
      source: this.sourceForType(eventType),
      timestamp: Date.now(),
      correlationId,
      payload: this.payloadForType(eventType),
    };
  }

  // Picks a random event type with weighted probability
  // Fraud and anomalies are rare (realistic), transactions are common
  private randomEventType(): EventType {
    const weighted: EventType[] = [
      EventType.TRANSACTION_PLACED,
      EventType.TRANSACTION_PLACED,
      EventType.TRANSACTION_PLACED,
      EventType.TRANSACTION_PLACED,
      EventType.TRANSACTION_COMPLETED,
      EventType.TRANSACTION_COMPLETED,
      EventType.TRANSACTION_COMPLETED,
      EventType.TRANSACTION_COMPLETED,
      EventType.PAYMENT_INITIATED,
      EventType.PAYMENT_INITIATED,
      EventType.PAYMENT_COMPLETED,
      EventType.PAYMENT_COMPLETED,
      EventType.ORDER_STATE_CHANGED,
      EventType.ORDER_STATE_CHANGED,
      EventType.TRANSACTION_FAILED,
      EventType.ANOMALY_FLAGGED,
      EventType.FRAUD_DETECTED,
    ];
    return weighted[Math.floor(Math.random() * weighted.length)];
  }

  // Critical events are fraud and anomalies. Everything else scales by type.
  private severityForType(type: EventType): EventSeverity {
    const severityMap: Record<EventType, EventSeverity> = {
      [EventType.TRANSACTION_PLACED]: EventSeverity.LOW,
      [EventType.TRANSACTION_COMPLETED]: EventSeverity.LOW,
      [EventType.PAYMENT_INITIATED]: EventSeverity.LOW,
      [EventType.PAYMENT_COMPLETED]: EventSeverity.LOW,
      [EventType.ORDER_STATE_CHANGED]: EventSeverity.MEDIUM,
      [EventType.TRANSACTION_FAILED]: EventSeverity.HIGH,
      [EventType.ANOMALY_FLAGGED]: EventSeverity.HIGH,
      [EventType.FRAUD_DETECTED]: EventSeverity.CRITICAL,
    };
    return severityMap[type];
  }

  // Which microservice would realistically emit this event
  private sourceForType(type: EventType): string {
    const sourceMap: Record<EventType, string> = {
      [EventType.TRANSACTION_PLACED]: 'transaction-service',
      [EventType.TRANSACTION_COMPLETED]: 'transaction-service',
      [EventType.TRANSACTION_FAILED]: 'transaction-service',
      [EventType.PAYMENT_INITIATED]: 'payment-service',
      [EventType.PAYMENT_COMPLETED]: 'payment-service',
      [EventType.ORDER_STATE_CHANGED]: 'order-service',
      [EventType.ANOMALY_FLAGGED]: 'risk-service',
      [EventType.FRAUD_DETECTED]: 'fraud-service',
    };
    return sourceMap[type];
  }

  // Realistic payload data for each event type
  private payloadForType(type: EventType): Record<string, unknown> {
    const currencies = ['USD', 'AED', 'SAR', 'QAR'];
    const regions = ['UAE', 'KSA', 'Qatar', 'Kuwait', 'Bahrain'];
    const randomAmount = () =>
      parseFloat((Math.random() * 5000 + 10).toFixed(2));
    const randomRegion = () =>
      regions[Math.floor(Math.random() * regions.length)];
    const randomCurrency = () =>
      currencies[Math.floor(Math.random() * currencies.length)];

    const payloadMap: Record<EventType, Record<string, unknown>> = {
      [EventType.TRANSACTION_PLACED]: {
        transactionId: randomUUID(),
        amount: randomAmount(),
        currency: randomCurrency(),
        region: randomRegion(),
        merchantId: `merchant_${Math.floor(Math.random() * 1000)}`,
      },
      [EventType.TRANSACTION_COMPLETED]: {
        transactionId: randomUUID(),
        amount: randomAmount(),
        currency: randomCurrency(),
        processingTimeMs: Math.floor(Math.random() * 3000 + 100),
      },
      [EventType.TRANSACTION_FAILED]: {
        transactionId: randomUUID(),
        reason: [
          'insufficient_funds',
          'card_declined',
          'timeout',
          'invalid_card',
          Math.floor(Math.random() * 4),
        ],
        amount: randomAmount(),
        currency: randomCurrency(),
      },
      [EventType.PAYMENT_INITIATED]: {
        paymentId: randomUUID(),
        amount: randomAmount(),
        currency: randomCurrency(),
        gateway: ['stripe', 'payfort', 'checkout'][
          Math.floor(Math.random() * 3)
        ],
      },
      [EventType.PAYMENT_COMPLETED]: {
        paymentId: randomUUID(),
        amount: randomAmount(),
        currency: randomCurrency(),
        region: randomRegion(),
      },
      [EventType.ORDER_STATE_CHANGED]: {
        orderId: randomUUID(),
        previousState: ['pending', 'confirmed', 'processing'][
          Math.floor(Math.random() * 3)
        ],
        newState: ['confirmed', 'processing', 'shipped', 'delivered'][
          Math.floor(Math.random() * 4)
        ],
        region: randomRegion(),
      },
      [EventType.ANOMALY_FLAGGED]: {
        anomalyType: ['volume_spike', 'unusual_pattern', 'geo_mismatch'][
          Math.floor(Math.random() * 3)
        ],
        affectedService: 'transaction-service',
        detectedAt: Date.now(),
        confidence: parseFloat((Math.random() * 0.4 + 0.6).toFixed(2)),
      },
      [EventType.FRAUD_DETECTED]: {
        transactionId: randomUUID(),
        fraudScore: parseFloat((Math.random() * 0.3 + 0.7).toFixed(2)),
        indicators: [
          'velocity_check',
          'geo_anomaly',
          'device_fingerprint',
        ].slice(0, Math.floor(Math.random() * 3) + 1),
        region: randomRegion(),
        amount: randomAmount(),
      },
    };

    return payloadMap[type];
  }
}
