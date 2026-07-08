import { Controller, Get, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StateService } from './state.service';
import { SystemState } from './dto/state.dto';

@ApiTags('state')
@Controller('api/state')
export class StateController {
    constructor(private readonly stateService: StateService) {}

    /**
     * Returns the current system state snapshot from Redis.
     * This is what the frontend dashboard polls for initial load.
     */
    @Get()
    @ApiOperation({ summary: 'Get current system state' })
    async getState(): Promise<SystemState> {
        return this.stateService.getState();
    }

    /**
     * Resets the state back to zero.
     * Useful for live demos and testing.
     */
    @Delete('reset')
    @ApiOperation({ summary: 'Reset system state to defaults' })
    async resetState(): Promise<SystemState> {
        return this.stateService.resetState();
    }
}
