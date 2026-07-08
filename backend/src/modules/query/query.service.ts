import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import {StateService} from '../state/state.service';
import {ContextBuilderService} from './context-builder.service';
import {QueryResponseDto} from './dto/query.dto';

@Injectable()
export class QueryService {
    private readonly logger = new Logger(QueryService.name);
    private readonly anthropic: Anthropic;

    constructor(
        private readonly configService: ConfigService,
        private readonly stateService: StateService,
        private readonly contextBuilder: ContextBuilderService,
    ) {
        // Initialize the Anthropic client with the API key from config
        this.anthropic = new Anthropic({
            apiKey: this.configService.get<string>('ANTHROPIC_API_KEY'),
        });
    }

    /**
     * Processes a natural language question about the current system state.
     * Fetches live state from Redis, formats it as context, and queries Claude.
     */
    async ask(question: string): Promise<QueryResponseDto> {
        this.logger.log(`Processing query: "${question}"`);

        // Step 1: Get the current system state from Redis
        const state = await this.stateService.getState();

        // Step 2: Format the state into a readable context string
        const context = this.contextBuilder.buildContext(state);
        const systemPrompt = this.contextBuilder.buildSystemPrompt();

        // Step 3: Build the full user message with context + question
        const userMessage = `
Here is the current system state:

${context}

Operator question: ${question}`;

        // Step 4: Call Claude API
        const response = await this.anthropic.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 1024,
            system: systemPrompt,
            messages: [
                {
                    role: 'user',
                    content: userMessage,
                },
            ],
        });

        // Step 5: Extract the text response
        const answer =
            response.content[0].type === 'text' ? response.content[0].text : '';

        this.logger.log(`Query processed. Tokens used: ${response.usage.input_tokens} in, ${response.usage.output_tokens} out`);

        return {
            answer,
            processedAt: Date.now(),
            contextSnapshot: {
                totalEvents: state.totalEvents,
                totalTransactionVolume: state.totalTransactionVolume,
                fraudCount: state.fraudCount,
                anomalyCount: state.anomalyCount,
            },
        };
    }
}
