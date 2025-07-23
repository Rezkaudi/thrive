// backend/src/domain/repositories/ISubscriptionRepository.ts
import { Subscription } from '../entities/Subscription';

export interface ISubscriptionRepository {
    create(subscription: Subscription): Promise<Subscription>;
    findById(id: string): Promise<Subscription | null>;
    findByUserId(userId: string): Promise<Subscription[]>;
    findActiveByUserId(userId: string): Promise<Subscription[]>;
    findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | null>;
    findByStripeCustomerId(stripeCustomerId: string): Promise<Subscription[]>;
    update(subscription: Subscription): Promise<Subscription>;
    delete(id: string): Promise<boolean>;
}