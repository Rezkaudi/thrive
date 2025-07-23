// backend/src/application/use-cases/subscription/CheckUserSubscriptionUseCase.ts
import { ISubscriptionRepository } from '../../../domain/repositories/ISubscriptionRepository';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';

export interface CheckUserSubscriptionDTO {
    userId: string;
}

export interface SubscriptionStatusResponse {
    hasActiveSubscription: boolean;
    subscriptions: Array<{
        id: string;
        plan: string;
        status: string;
        currentPeriodEnd: Date;
    }>;
}

export class CheckUserSubscriptionUseCase {
    constructor(
        private subscriptionRepository: ISubscriptionRepository,
        private userRepository: IUserRepository
    ) { }

    async execute(dto: CheckUserSubscriptionDTO): Promise<SubscriptionStatusResponse> {
        // Verify user exists
        const user = await this.userRepository.findById(dto.userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Get all active subscriptions for the user
        const activeSubscriptions = await this.subscriptionRepository.findActiveByUserId(dto.userId);

        // Check if user has any active subscription
        const hasActiveSubscription = activeSubscriptions.length > 0;

        return {
            hasActiveSubscription,
            subscriptions: activeSubscriptions.map(sub => ({
                id: sub.id,
                plan: sub.subscriptionPlan,
                status: sub.status,
                currentPeriodEnd: sub.currentPeriodEnd
            })),
        };
    }
}