import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Job } from 'bull';
import { SnapshotEntity } from './entities/snapshot.entity';
import { StateService } from '../state/state.service';

// The queue name must match exactly what we use when adding jobs
export const SNAPSHOT_QUEUE = 'snapshot';
export const SNAPSHOT_JOB = 'take-snapshot';

@Processor(SNAPSHOT_QUEUE)
export class SnapshotProcessor {
    private readonly logger = new Logger(SnapshotProcessor.name);

    constructor(
        private readonly stateService: StateService,

        // TypeORM repository injected for the SnapshotEntity table
        @InjectRepository(SnapshotEntity)
        private readonly snapshotRepository: Repository<SnapshotEntity>,
    ) {}

    /**
     * Processes a snapshot job.
     * Reads current state from Redis and persists it to PostgreSQL.
     * BullMQ calls this automatically when a job arrives in the queue.
     */
    @Process(SNAPSHOT_JOB)
    async handleSnapshot(job: Job): Promise<void> {
        this.logger.log(`Processing snapshot job #${job.id}`);

        try {
            // Read current state from Redis
            const state = await this.stateService.getState();

            // Build the snapshot record
            const snapshot = this.snapshotRepository.create({
                totalEvents: state.totalEvents,
                totalTransactionVolume: state.totalTransactionVolume,
                transactionCount: state.transactionCount,
                failedTransactionCount: state.failedTransactionCount,
                fraudCount: state.fraudCount,
                anomalyCount: state.anomalyCount,
                regionalVolume: state.regionalVolume,
                eventCountByType: state.eventCountByType,
                recentFraudEvents: state.recentFraudEvents.slice(0, 3) as unknown as Record<string, unknown>[],
            });

            // Persist to PostgreSQL
            await this.snapshotRepository.save(snapshot);

            this.logger.log(
                `Snapshot saved. Total events: ${state.totalEvents}, ` +
                `Volume: $${state.totalTransactionVolume.toLocaleString()}`,
            );
        } catch (error) {
            this.logger.error(`Snapshot job failed: ${(error as Error).message}`);
            // Rethrowing causes BullMQ to mark the job as failed
            // and retry it based on the queue configuration
            throw error;
        }
    }
}
