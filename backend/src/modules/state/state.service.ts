import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';
import { SystemState, DEFAULT_STATE, ActiveAnomaly, RecentFraudEvent } from './dto/state.dto';
import { EventDto, EventType } from '../events/dto/event.dto';

// Maximum number of anomalies and fraud events to keep in state
// Keeps the state object bounded in size
const MAX_ACTIVE_ANOMALIES = 10;
const MAX_RECENT_FRAUD = 10;

@Injectable()
export class StateService {
    private readonly logger = new Logger(StateService.name);

    constructor(private readonly redisService: RedisService) {}

    /**
     * Reads the current state from Redis.
     * If no state exists yet (first boot), returns the default state.
     */
    async getState(): Promise<SystemState> {
        const state = await this.redisService.get<SystemState>(
            RedisService.STATE_KEY,
        );
        return state ?? { ...DEFAULT_STATE, lastUpdated: Date.now() };
    }

    /**
     * Core method: applies an incoming event to the current state.
     * This is the state machine transition function.
     * Every event type has specific state mutations it triggers.
     */
    async processEvent(event: EventDto): Promise<SystemState> {
        // Read current state
        const state = await this.getState();

        // Apply mutations that apply to ALL event types
        state.totalEvents += 1;
        state.lastUpdated = Date.now();

        // Increment count for this event type
        state.eventCountByType[event.type] =
            (state.eventCountByType[event.type] ?? 0) + 1;

        // Increment count for the source service
        state.eventCountBySource[event.source] =
            (state.eventCountBySource[event.source] ?? 0) + 1;

        // Apply mutations specific to each event type
        this.applyTypeSpecificMutations(state, event);

        // Persist updated state back to Redis
        await this.redisService.set(RedisService.STATE_KEY, state);

        // Notify any subscribers that state has changed
        await this.redisService.publish(RedisService.STATE_CHANNEL, {
            updatedAt: state.lastUpdated,
        });

        this.logger.debug(
            `State updated. Total events: ${state.totalEvents}`,
        );

        return state;
    }

    /**
     * Resets the state back to defaults.
     * Useful for demos and testing without restarting the server.
     */
    async resetState(): Promise<SystemState> {
        const fresh = { ...DEFAULT_STATE, lastUpdated: Date.now() };
        await this.redisService.set(RedisService.STATE_KEY, fresh);
        this.logger.log('System state reset');
        return fresh;
    }

    /**
     * Applies state mutations specific to each event type.
     * Each case handles one event type's effect on the system state.
     */
    private applyTypeSpecificMutations(
        state: SystemState,
        event: EventDto,
    ): void {
        switch (event.type) {

            case EventType.TRANSACTION_PLACED:
            case EventType.TRANSACTION_COMPLETED:
            case EventType.PAYMENT_COMPLETED: {
                // Extract amount from payload and add to running volume total
                const amount = event.payload['amount'];
                const region = event.payload['region'];

                if (typeof amount === 'number') {
                    state.totalTransactionVolume = parseFloat(
                        (state.totalTransactionVolume + amount).toFixed(2),
                    );
                    state.transactionCount += 1;
                }

                // Add to regional volume breakdown
                if (typeof region === 'string' && typeof amount === 'number') {
                    state.regionalVolume[region] = parseFloat(
                        ((state.regionalVolume[region] ?? 0) + amount).toFixed(2),
                    );
                }
                break;
            }

            case EventType.TRANSACTION_FAILED: {
                state.failedTransactionCount += 1;
                break;
            }

            case EventType.FRAUD_DETECTED: {
                state.fraudCount += 1;

                // Build a typed fraud event record and add to the recent list
                const fraudEvent: RecentFraudEvent = {
                    id: event.id,
                    transactionId: String(event.payload['transactionId'] ?? ''),
                    fraudScore: Number(event.payload['fraudScore'] ?? 0),
                    indicators: Array.isArray(event.payload['indicators'])
                        ? (event.payload['indicators'] as string[])
                        : [],
                    region: String(event.payload['region'] ?? 'unknown'),
                    amount: Number(event.payload['amount'] ?? 0),
                    detectedAt: event.timestamp,
                };

                // Keep only the most recent fraud events
                state.recentFraudEvents = [
                    fraudEvent,
                    ...state.recentFraudEvents,
                ].slice(0, MAX_RECENT_FRAUD);
                break;
            }

            case EventType.ANOMALY_FLAGGED: {
                state.anomalyCount += 1;

                const anomaly: ActiveAnomaly = {
                    id: event.id,
                    type: String(event.payload['anomalyType'] ?? 'unknown'),
                    detectedAt: event.timestamp,
                    confidence: Number(event.payload['confidence'] ?? 0),
                    affectedService: String(event.payload['affectedService'] ?? 'unknown'),
                };

                // Keep only the most recent anomalies
                state.activeAnomalies = [
                    anomaly,
                    ...state.activeAnomalies,
                ].slice(0, MAX_ACTIVE_ANOMALIES);
                break;
            }

            // Payment initiated and order state changed affect counts only
            // already handled above by the universal eventCountByType increment
            case EventType.PAYMENT_INITIATED:
            case EventType.ORDER_STATE_CHANGED:
                break;
        }
    }
}
