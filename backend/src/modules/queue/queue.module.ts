import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { SnapshotProcessor } from './snapshot.processor';
import { SnapshotEntity } from './entities/snapshot.entity';
import { StateModule } from '../state/state.module';
import { SNAPSHOT_QUEUE } from './snapshot.processor';

@Module({
    imports: [
        // Register BullMQ queue with Redis connection from config
        BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                redis: {
                    host: configService.get<string>('redis.host', 'localhost'),
                    port: configService.get<number>('redis.port', 6379),
                },
            }),
            inject: [ConfigService],
        }),

        // Register the specific queue we use for snapshots
        BullModule.registerQueue({
            name: SNAPSHOT_QUEUE,
            defaultJobOptions: {
                attempts: 3,        // retry failed jobs up to 3 times
                backoff: {
                    type: 'exponential',
                    delay: 5000,      // start with 5 second delay, doubles each retry
                },
            },
        }),

        // Register the SnapshotEntity so TypeORM manages its table
        TypeOrmModule.forFeature([SnapshotEntity]),

        StateModule,
    ],
    controllers: [QueueController],
    providers: [QueueService, SnapshotProcessor],
    exports: [QueueService],
})
export class QueueModule {}
