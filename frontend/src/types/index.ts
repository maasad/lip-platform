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

export interface LiveEvent {
    id: string;
    type: EventType;
    severity: EventSeverity;
    source: string;
    timestamp: number;
    payload: Record<string, unknown>;
    correlationId?: string;
}

export interface ActiveAnomaly {
    id: string;
    type: string;
    detectedAt: number;
    confidence: number;
    affectedService: string;
}

export interface RecentFraudEvent {
    id: string;
    transactionId: string;
    fraudScore: number;
    indicators: string[];
    region: string;
    amount: number;
    detectedAt: number;
}

export interface SystemState {
    totalEvents: number;
    totalTransactionVolume: number;
    transactionCount: number;
    failedTransactionCount: number;
    fraudCount: number;
    anomalyCount: number;
    eventCountByType: Record<string, number>;
    eventCountBySource: Record<string, number>;
    regionalVolume: Record<string, number>;
    activeAnomalies: ActiveAnomaly[];
    recentFraudEvents: RecentFraudEvent[];
    lastUpdated: number;
}

export interface QueryResponse {
    answer: string;
    processedAt: number;
    contextSnapshot: {
        totalEvents: number;
        totalTransactionVolume: number;
        fraudCount: number;
        anomalyCount: number;
    };
}
