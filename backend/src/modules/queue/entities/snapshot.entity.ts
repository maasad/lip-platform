import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    Index,
} from 'typeorm';

@Entity('system_snapshots')
export class SnapshotEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    // Index on createdAt because we query snapshots by time range
    @CreateDateColumn()
    @Index()
    createdAt!: Date;

    @Column({ type: 'int' })
    totalEvents!: number;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    totalTransactionVolume!: number;

    @Column({ type: 'int' })
    transactionCount!: number;

    @Column({ type: 'int' })
    failedTransactionCount!: number;

    @Column({ type: 'int' })
    fraudCount!: number;

    @Column({ type: 'int' })
    anomalyCount!: number;

    // Store the full regional breakdown as JSON
    // PostgreSQL jsonb type is indexed and queryable
    @Column({ type: 'jsonb' })
    regionalVolume!: Record<string, number>;

    // Store event type counts as JSON
    @Column({ type: 'jsonb' })
    eventCountByType!: Record<string, number>;

    // Store the top 3 fraud events at snapshot time
    @Column({ type: 'jsonb', nullable: true })
    recentFraudEvents!: Record<string, unknown>[];
}
