// backend/src/application/use-cases/subscription/CheckUserSubscriptionUseCase.ts
import { ISubscriptionRepository } from '../../../domain/repositories/ISubscriptionRepository';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';

export interface CheckUserSubscriptionDTO {
    userId: string;
}

export interface SubscriptionStatusResponse {
    hasActiveSubscription: boolean;
    hasTrailingSubscription: boolean;
    status: string | null
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
        const trailingSubscriptions = await this.subscriptionRepository.findByUserId(dto.userId);

        console.log(activeSubscriptions)
        console.log(trailingSubscriptions)

        // Check if user has any active subscription
        const hasActiveSubscription = user.role === "ADMIN" ? true : activeSubscriptions.length > 0;
        const hasTrailingSubscription = user.role === "ADMIN" ? true : trailingSubscriptions.length > 0;
        const status = user.role === "ADMIN" ? "active" : trailingSubscriptions ? trailingSubscriptions[0]?.status : null

        return {
            hasActiveSubscription,
            hasTrailingSubscription,
            status,
            subscriptions: activeSubscriptions.map(sub => ({
                id: sub.id,
                plan: sub.subscriptionPlan,
                status: sub.status,
                currentPeriodEnd: sub.currentPeriodEnd
            })),
        };
    }
}