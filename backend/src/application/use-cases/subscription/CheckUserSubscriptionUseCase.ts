// backend/src/application/use-cases/subscription/CheckUserSubscriptionUseCase.ts
import { ISubscriptionRepository } from '../../../domain/repositories/ISubscriptionRepository';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';

export interface CheckUserSubscriptionDTO {
    userId: string;
}

export interface SubscriptionStatusResponse {
    hasSubscription: boolean;
    hasAccessToCourses: boolean;
    status: string | null;
    currentPlan: string | null;
    isTrialing: boolean;
    // New free trial fields (no credit card)
    isInFreeTrial: boolean;
    freeTrialExpired: boolean;
    freeTrialEndDate: Date | null;
    trialConvertedToPaid: boolean;
    subscription: {
        id: string;
        plan: string;
        status: string;
        currentPeriodEnd: Date;
    } | null;
}

export class CheckUserSubscriptionUseCase {
    constructor(
        private subscriptionRepository: ISubscriptionRepository,
        private userRepository: IUserRepository
    ) { }

    async execute(dto: CheckUserSubscriptionDTO): Promise<SubscriptionStatusResponse> {
        const user = await this.userRepository.findById(dto.userId);
        if (!user) {
            throw new Error('User not found');
        }

        const subscription = await this.subscriptionRepository.findByUserId(dto.userId);
        const activeSubscription = await this.subscriptionRepository.findActiveByUserId(dto.userId);

        // Check free trial status (no credit card required trial)
        const now = new Date();
        const isInFreeTrial = user.trialStartDate !== null &&
            user.trialEndDate !== null &&
            now < user.trialEndDate &&
            !subscription; // Not in free trial if they have a subscription

        const freeTrialExpired = user.trialEndDate !== null &&
            now >= user.trialEndDate &&
            !subscription; // Only expired if no subscription exists

        // Admin always has access
        if (user.role === 'ADMIN') {
            return {
                hasSubscription: true,
                hasAccessToCourses: true,
                status: 'active',
                currentPlan: 'premium',
                isTrialing: false,
                isInFreeTrial: false,
                freeTrialExpired: false,
                freeTrialEndDate: null,
                trialConvertedToPaid: user.trialConvertedToPaid,
                subscription: null,
            };
        }

        // Determine access based on subscription OR free trial
        const hasSubscription = subscription !== null;
        const hasAccessToCourses = activeSubscription !== null || isInFreeTrial;
        const status = subscription ? subscription.status : (isInFreeTrial ? 'free_trial' : null);
        const currentPlan = subscription ? subscription.subscriptionPlan : null;
        // isTrialing is true for subscription-based trial OR free trial (no credit card)
        const isTrialing = subscription?.status === 'trialing' || isInFreeTrial;

        return {
            hasSubscription,
            hasAccessToCourses,
            status,
            currentPlan,
            isTrialing,
            isInFreeTrial,
            freeTrialExpired,
            freeTrialEndDate: user.trialEndDate,
            trialConvertedToPaid: user.trialConvertedToPaid,
            subscription: subscription
                ? {
                    id: subscription.id,
                    plan: subscription.subscriptionPlan,
                    status: subscription.status,
                    currentPeriodEnd: subscription.currentPeriodEnd,
                }
                : null,
        };
    }
}