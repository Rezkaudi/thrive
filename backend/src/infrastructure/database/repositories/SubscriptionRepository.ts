// backend/src/infrastructure/database/repositories/SubscriptionRepository.ts
import { Repository, In } from 'typeorm';
import { AppDataSource } from '../config/database.config';
import { SubscriptionEntity } from '../entities/Subscription.entity';
import { ISubscriptionRepository } from '../../../domain/repositories/ISubscriptionRepository';
import { Subscription } from '../../../domain/entities/Subscription';

export class SubscriptionRepository implements ISubscriptionRepository {
    private repository: Repository<SubscriptionEntity>;

    constructor() {
        this.repository = AppDataSource.getRepository(SubscriptionEntity);
    }

    async create(subscription: Subscription): Promise<Subscription> {
        const entity = this.toEntity(subscription);
        const saved = await this.repository.save(entity);
        return this.toDomain(saved);
    }

    async findById(id: string): Promise<Subscription | null> {
        const entity = await this.repository.findOne({ where: { id } });
        return entity ? this.toDomain(entity) : null;
    }

    async findByUserId(userId: string): Promise<Subscription[]> {
        const entities = await this.repository.find({
            where: { userId },
            order: { createdAt: 'DESC' }
        });
        return entities.map(e => this.toDomain(e));
    }

    async findActiveByUserId(userId: string): Promise<Subscription[]> {
        const entities = await this.repository.find({
            where: {
                userId,
                status: In(['active', 'trialing'])
            },
            order: { createdAt: 'DESC' }
        });
        return entities.map(e => this.toDomain(e));
    }

    async findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | null> {
        const entity = await this.repository.findOne({
            where: { stripeSubscriptionId }
        });
        return entity ? this.toDomain(entity) : null;
    }

    async findByStripeCustomerId(stripeCustomerId: string): Promise<Subscription[]> {
        const entities = await this.repository.find({
            where: { stripeCustomerId },
            order: { createdAt: 'DESC' }
        });
        return entities.map(e => this.toDomain(e));
    }

    async update(subscription: Subscription): Promise<Subscription> {
        const entity = this.toEntity(subscription);
        const saved = await this.repository.save(entity);
        return this.toDomain(saved);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected !== 0;
    }

    private toDomain(entity: SubscriptionEntity): Subscription {
        return new Subscription(
            entity.id,
            entity.userId,
            entity.stripeCustomerId,
            entity.stripeSubscriptionId ?? undefined,
            entity.stripePaymentIntentId ?? undefined,
            entity.subscriptionPlan,
            entity.status,
            entity.currentPeriodStart,
            entity.currentPeriodEnd,
            entity.createdAt,
            entity.updatedAt
        );
    }

    private toEntity(subscription: Subscription): SubscriptionEntity {
        const entity = new SubscriptionEntity();
        entity.id = subscription.id;
        entity.userId = subscription.userId;
        entity.stripeCustomerId = subscription.stripeCustomerId;
        entity.stripeSubscriptionId = subscription.stripeSubscriptionId || null;
        entity.stripePaymentIntentId = subscription.stripePaymentIntentId || null;
        entity.subscriptionPlan = subscription.subscriptionPlan;
        entity.status = subscription.status;
        entity.currentPeriodStart = subscription.currentPeriodStart;
        entity.currentPeriodEnd = subscription.currentPeriodEnd;
        entity.createdAt = subscription.createdAt;
        entity.updatedAt = subscription.updatedAt;
        return entity;
    }
}
