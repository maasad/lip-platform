export interface RegionalVolume {
    [region: string]: number;
}

export interface EventCountByType {
    [eventType: string]: number;
}

export interface EventCountBySource {
    [source: string]: number;
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

// This is the master state object stored in Redis
export interface SystemState {
    totalEvents: number;
    totalTransactionVolume: number;
    transactionCount: number;
    failedTransactionCount: number;
    fraudCount: number;
    anomalyCount: number;
    eventCountByType: EventCountByType;
    eventCountBySource: EventCountBySource;
    regionalVolume: RegionalVolume;
    activeAnomalies: ActiveAnomaly[];
    recentFraudEvents: RecentFraudEvent[];
    lastUpdated: number;
}

// Default state when Redis has no existing state
// Used on first boot or after a Redis flush
export const DEFAULT_STATE: SystemState = {
    totalEvents: 0,
    totalTransactionVolume: 0,
    transactionCount: 0,
    failedTransactionCount: 0,
    fraudCount: 0,
    anomalyCount: 0,
    eventCountByType: {},
    eventCountBySource: {},
    regionalVolume: {},
    activeAnomalies: [],
    recentFraudEvents: [],
    lastUpdated: Date.now(),
};
