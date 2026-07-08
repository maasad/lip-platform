import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    private client: Redis;

    // Redis key where the system state is stored
    // A constant here means if we ever rename it, we change it in one place
    static readonly STATE_KEY = 'lip:system:state';

    // Redis channel name for pub/sub notifications
    static readonly STATE_CHANNEL = 'lip:state:updated';

    constructor(private readonly configService: ConfigService) {}

    onModuleInit() {
        // Read Redis connection config from the typed config we built on Day 1
        const host = this.configService.get<string>('redis.host', 'localhost');
        const port = this.configService.get<number>('redis.port', 6379);

        this.client = new Redis({ host, port });

        this.client.on('connect', () => {
            this.logger.log(`Redis connected on ${host}:${port}`);
        });

        this.client.on('error', (err: Error) => {
            this.logger.error(`Redis error: ${err.message}`);
        });
    }

    onModuleDestroy() {
        // Clean up the Redis connection when the app shuts down
        if (this.client) {
            this.client.disconnect();
            this.logger.log('Redis connection closed');
        }
    }

    /**
     * Stores a value as a JSON string under the given key.
     * All our state objects are serialized to JSON before storage.
     */
    async set(key: string, value: unknown): Promise<void> {
        await this.client.set(key, JSON.stringify(value));
    }

    /**
     * Retrieves and deserializes a JSON value from Redis.
     * Returns null if the key does not exist.
     */
    async get<T>(key: string): Promise<T | null> {
        const value = await this.client.get(key);
        if (!value) return null;
        return JSON.parse(value) as T;
    }

    /**
     * Publishes a message to a Redis pub/sub channel.
     * Subscribers on this channel receive the message instantly.
     */
    async publish(channel: string, message: unknown): Promise<void> {
        await this.client.publish(channel, JSON.stringify(message));
    }

    /**
     * Deletes a key from Redis.
     * Used in testing and for manual state resets.
     */
    async del(key: string): Promise<void> {
        await this.client.del(key);
    }
}
