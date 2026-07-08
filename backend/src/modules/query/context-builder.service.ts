import {Injectable} from '@nestjs/common';
import {SystemState} from '../state/dto/state.dto';

@Injectable()
export class ContextBuilderService {
    /**
     * Formats the current system state into a structured context string.
     * This is injected into every Claude prompt so the model reasons
     * over real data rather than relying on training knowledge.
     */
    buildContext(state: SystemState): string {
        const topRegions = Object.entries(state.regionalVolume)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([region, volume]) => `  - ${region}: $${volume.toLocaleString()}`)
            .join('\n');

        const topEventTypes = Object.entries(state.eventCountByType)
            .sort(([, a], [, b]) => b - a)
            .map(([type, count]) => `  - ${type}: ${count}`)
            .join('\n');

        const topServices = Object.entries(state.eventCountBySource)
            .sort(([, a], [, b]) => b - a)
            .map(([service, count]) => `  - ${service}: ${count} events`)
            .join('\n');

        const recentFraud = state.recentFraudEvents
            .slice(0, 3)
            .map(
                (f) =>
                    `  - Transaction ${f.transactionId.slice(0, 8)}...: ` +
                    `score ${f.fraudScore}, region ${f.region}, ` +
                    `amount $${f.amount}, indicators: ${f.indicators.join(', ')}`,
            )
            .join('\n');

        const activeAnomalies = state.activeAnomalies
            .slice(0, 3)
            .map(
                (a) =>
                    `  - ${a.type} on ${a.affectedService}: ` +
                    `confidence ${(a.confidence * 100).toFixed(0)}%`,
            )
            .join('\n');

        const failureRate =
            state.transactionCount > 0
                ? ((state.failedTransactionCount / state.transactionCount) * 100).toFixed(1)
                : '0.0';

        // This is the context string injected into every Claude prompt
        return `
LIVE SYSTEM STATE — LiveOps Intelligence Platform
Generated at: ${new Date(state.lastUpdated).toISOString()}

TRANSACTION OVERVIEW
- Total events processed: ${state.totalEvents}
- Total transaction volume: $${state.totalTransactionVolume.toLocaleString()}
- Successful transactions: ${state.transactionCount}
- Failed transactions: ${state.failedTransactionCount}
- Failure rate: ${failureRate}%

SECURITY STATUS
- Fraud events detected: ${state.fraudCount}
- Active anomalies: ${state.anomalyCount}

REGIONAL VOLUME BREAKDOWN
${topRegions || '  - No regional data yet'}

EVENT BREAKDOWN BY TYPE
${topEventTypes || '  - No events yet'}

ACTIVE SERVICES
${topServices || '  - No service data yet'}

RECENT FRAUD EVENTS (last 3)
${recentFraud || '  - No fraud events detected'}

ACTIVE ANOMALIES (top 3)
${activeAnomalies || '  - No active anomalies'}
`.trim();
    }

    /**
     * Builds the system prompt that defines Claude's role and behavior.
     * This is sent as the system message on every API call.
     */
    buildSystemPrompt(): string {
        return `You are an operational intelligence assistant for a live financial platform.
You have access to real-time system state data including transaction volumes,
fraud events, anomalies, and regional breakdowns across GCC markets.

Your job is to answer operator questions clearly and accurately based ONLY
on the system state data provided. Do not invent numbers or make assumptions
beyond what the data shows.

Rules:
- Answer concisely. Operators are monitoring live systems and need fast answers.
- Always cite specific numbers from the data when relevant.
- If the data does not contain enough information to answer a question, say so clearly.
- Flag critical issues (high fraud scores, critical anomalies) prominently.
- Format numbers clearly: use $ for amounts, % for rates, and commas for large numbers.`;
    }
}
