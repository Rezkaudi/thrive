// backend/src/infrastructure/database/entities/Subscription.entity.ts
import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index
} from 'typeorm';
import { UserEntity } from './User.entity';
import { SubscriptionPlan, SubscriptionStatus } from '../../../domain/entities/Subscription';

@Entity('subscriptions')
@Index(['userId', 'status'])
// @Index(['stripeSubscriptionId'], { unique: true, where: 'stripeSubscriptionId IS NOT NULL' })
export class SubscriptionEntity {
    @PrimaryColumn()
    id!: string;

    @Column()
    userId!: string;

    @ManyToOne(() => UserEntity, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    })
    @JoinColumn({ name: 'userId' })
    user!: UserEntity;

    @Column()
    stripeCustomerId!: string;

    @Column({ type: 'varchar', nullable: true })
    stripeSubscriptionId!: string | null;

    @Column({ type: 'varchar', nullable: true })
    stripePaymentIntentId!: string | null;

    @Column({
        type: 'enum',
        enum: ['monthly', 'yearly', 'one-time']
    })
    subscriptionPlan!: SubscriptionPlan;

    @Column({
        type: 'enum',
        enum: ['active', 'canceled', 'past_due', 'unpaid', 'trialing'],
        default: 'active'
    })
    status!: SubscriptionStatus;

    @Column({ type: 'timestamp' })
    currentPeriodStart!: Date;

    @Column({ type: 'timestamp' })
    currentPeriodEnd!: Date;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}