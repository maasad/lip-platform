import { Module } from '@nestjs/common';
import { QueryController } from './query.controller';
import { QueryService } from './query.service';
import { ContextBuilderService } from './context-builder.service';
import { StateModule } from '../state/state.module';

@Module({
    imports: [StateModule], // gives QueryService access to StateService
    controllers: [QueryController],
    providers: [QueryService, ContextBuilderService],
})
export class QueryModule {}
