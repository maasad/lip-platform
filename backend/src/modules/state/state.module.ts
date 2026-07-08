import { Module } from '@nestjs/common';
import { StateService } from './state.service';
import { RedisService } from './redis.service';
import { StateController } from './state.controller';

@Module({
    controllers: [StateController],
    providers: [RedisService, StateService],
    exports: [StateService, RedisService],
})
export class StateModule {}
