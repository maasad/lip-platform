import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import jwtConfig from './config/jwt.config';
import { EventsModule } from './modules/events/events.module';
import { StateModule } from './modules/state/state.module';
import { QueryModule } from './modules/query/query.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            load: [databaseConfig, redisConfig, jwtConfig],
        }),
        StateModule,  // Redis connection and state machine
        EventsModule, // WebSocket gateway and event generator
        QueryModule,
    ],
})
export class AppModule {}
