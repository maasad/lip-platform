import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import jwtConfig from './config/jwt.config';
import { EventsModule } from './modules/events/events.module';
import { StateModule } from './modules/state/state.module';
import { QueryModule } from './modules/query/query.module';
import { QueueModule } from './modules/queue/queue.module';
import { HealthModule } from './modules/health/health.module';
import { SnapshotEntity } from './modules/queue/entities/snapshot.entity';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            load: [databaseConfig, redisConfig, jwtConfig],
        }),

        // TypeORM connects to PostgreSQL and auto-creates tables
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('database.host'),
                port: configService.get<number>('database.port'),
                username: configService.get<string>('database.username'),
                password: configService.get<string>('database.password'),
                database: configService.get<string>('database.name'),
                entities: [SnapshotEntity],
                synchronize: process.env.NODE_ENV !== 'production',
                logging: false,
                ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
            }),
            inject: [ConfigService],
        }),

        StateModule,
        EventsModule,
        QueryModule,
        QueueModule,
        HealthModule,
    ],
})
export class AppModule {}
