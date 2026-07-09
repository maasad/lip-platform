import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { QueueService } from './queue.service';
import { SnapshotEntity } from './entities/snapshot.entity';

@ApiTags('snapshots')
@Controller('api/snapshots')
export class QueueController {
    constructor(private readonly queueService: QueueService) {}

    /**
     * Returns recent system state snapshots from PostgreSQL.
     * Each snapshot is a point-in-time record of the full system state.
     */
    @Get()
    @ApiOperation({ summary: 'Get recent system state snapshots' })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of snapshots to return (default 12)',
    })
    async getSnapshots(
        @Query('limit') limit?: number,
    ): Promise<SnapshotEntity[]> {
        return this.queueService.getRecentSnapshots(limit ?? 12);
    }

    /**
     * Manually triggers a state snapshot outside the 5-minute schedule.
     * Used for testing and live demos.
     */
    @Post('trigger')
    @ApiOperation({ summary: 'Manually trigger a state snapshot' })
    async triggerSnapshot(): Promise<{ message: string }> {
        await this.queueService.triggerSnapshot();
        return { message: 'Snapshot job queued successfully' };
    }
}
