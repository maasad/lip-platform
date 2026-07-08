import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryRequestDto {
    @ApiProperty({
        description: 'Natural language question about the current system state',
        example: 'How many fraud events have been detected and which regions are affected?',
    })
    @IsString()
    @MinLength(5)
    @MaxLength(500)
    question!: string;
}

export class QueryResponseDto {
    @ApiProperty({ description: 'The answer from Claude based on current system state' })
    answer!: string;

    @ApiProperty({ description: 'Unix timestamp of when the query was processed' })
    processedAt!: number;

    @ApiProperty({ description: 'Snapshot of system state used as context for this query' })
    contextSnapshot!: {
        totalEvents: number;
        totalTransactionVolume: number;
        fraudCount: number;
        anomalyCount: number;
    };
}
