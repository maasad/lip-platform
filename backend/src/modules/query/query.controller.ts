import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { QueryService } from './query.service';
import { QueryRequestDto, QueryResponseDto } from './dto/query.dto';

@ApiTags('query')
@Controller('api/query')
export class QueryController {
    constructor(private readonly queryService: QueryService) {}

    /**
     * Accepts a natural language question and returns a grounded answer
     * based on the current live system state from Redis.
     */
    @Post()
    @ApiOperation({
        summary: 'Query the system state using natural language',
        description:
            'Ask any question about the current operational state. Claude answers based on live Redis data.',
    })
    async ask(@Body() dto: QueryRequestDto): Promise<QueryResponseDto> {
        return this.queryService.ask(dto.question);
    }
}
