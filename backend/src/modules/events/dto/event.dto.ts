import {
  IsString,
  IsNumber,
  IsEnum,
  IsObject,
  IsOptional,
} from 'class-validator';

export enum EventType {
  TRANSACTION_PLACED = 'TRANSACTION_PLACED',
  TRANSACTION_COMPLETED = 'TRANSACTION_COMPLETED',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  ANOMALY_FLAGGED = 'ANOMALY_FLAGGED',
  ORDER_STATE_CHANGED = 'ORDER_STATE_CHANGED',
  PAYMENT_INITIATED = 'PAYMENT_INITIATED',
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',
  FRAUD_DETECTED = 'FRAUD_DETECTED',
}

export enum EventSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export class EventDto {
  @IsString()
  id!: string;

  @IsEnum(EventType)
  type!: EventType;

  @IsEnum(EventSeverity)
  severity!: EventSeverity;

  @IsString()
  source!: string;

  @IsNumber()
  timestamp!: number;

  @IsObject()
  payload!: Record<string, unknown>;

  @IsString()
  @IsOptional()
  correlationId?: string;
}
