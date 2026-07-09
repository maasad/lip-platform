import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
    HealthCheck,
    HealthCheckService,
    MemoryHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('health')
@Controller('api/health')
export class HealthController {
    constructor(
        private readonly health: HealthCheckService,
        private readonly memory: MemoryHealthIndicator,
    ) {}

    @Get()
    @HealthCheck()
    @ApiOperation({ summary: 'Check application health status' })
    check() {
        return this.health.check([
            // Alert if heap usage exceeds 300MB
            () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
        ]);
    }
}
