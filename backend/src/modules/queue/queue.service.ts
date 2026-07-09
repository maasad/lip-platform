import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Queue } from 'bull';
import { SNAPSHOT_QUEUE, SNAPSHOT_JOB } from './snapshot.processor';
import { SnapshotEntity } from './entities/snapshot.entity';

@Injectable()
export class QueueService implements OnModuleInit {
    private readonly logger = new Logger(QueueService.name);

    constructor(
        @InjectQueue(SNAPSHOT_QUEUE)
        private readonly snapshotQueue: Queue,

        @InjectRepository(SnapshotEntity)
        private readonly snapshotRepository: Repository<SnapshotEntity>,
    ) {}

    /**
     * Schedules the recurring snapshot job when the module loads.
     * Uses a repeating job so BullMQ handles the schedule,
     * not a fragile setInterval.
     */
    async onModuleInit(): Promise<void> {
        // Remove any existing repeating jobs to avoid duplicates on restart
        await this.snapshotQueue.removeRepeatable(SNAPSHOT_JOB, {
            every: 5 * 60 * 1000, // 5 minutes in milliseconds
        });

        // Add the repeating snapshot job
        await this.snapshotQueue.add(
            SNAPSHOT_JOB,
            {},
            {
                repeat: { every: 5 * 60 * 1000 },
                removeOnComplete: 10, // keep last 10 completed jobs in Redis
                removeOnFail: 5,      // keep last 5 failed jobs for debugging
            },
        );

        this.logger.log('Snapshot job scheduled every 5 minutes');
    }

    /**
     * Returns the most recent snapshots from PostgreSQL.
     * Used by the history endpoint and the Claude query context.
     */
    async getRecentSnapshots(limit = 12): Promise<SnapshotEntity[]> {
        return this.snapshotRepository.find({
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }

    /**
     * Manually triggers a snapshot outside the schedule.
     * Useful for demos and testing.
     */
    async triggerSnapshot(): Promise<void> {
        await this.snapshotQueue.add(SNAPSHOT_JOB, {}, {
            removeOnComplete: true,
        });
        this.logger.log('Manual snapshot triggered');
    }
}
