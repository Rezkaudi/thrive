import { ENV_CONFIG } from '../../../infrastructure/config/env.config';
import { SubscriptionRepository } from '../../../infrastructure/database/repositories/SubscriptionRepository';
import { PaymentService } from '../../../infrastructure/services/PaymentService';

export interface CreateCheckoutSessionRequest {
    mode?: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: any;
    planType?: string;
    email: string;
    userId: string;
}

export interface CreateCheckoutSessionResponse {
    sessionId: string;
    isDiscounted: boolean;
}

export class CreateCheckoutSessionUseCase {
    private readonly DISCOUNT_LIMIT = Number(ENV_CONFIG.STRIPE_DISCOUNT_LIMIT_USERS);
    private readonly DISCOUNT_PRICES = {
        monthly: {
            regular: ENV_CONFIG.STRIPE_MONTHLY_PRICE_ID || '',
            discounted: ENV_CONFIG.STRIPE_MONTHLY_DISCOUNT_PRICE_ID || ''
        },
        yearly: {
            regular: ENV_CONFIG.STRIPE_YEARLY_PRICE_ID || '',
            discounted: ENV_CONFIG.STRIPE_YEARLY_DISCOUNT_PRICE_ID || ''
        },
        monthlySpecial: {
            regular: ENV_CONFIG.STRIPE_MONTHLY_PRICE_ID_SPECIAL || '',
            discounted: ENV_CONFIG.STRIPE_MONTHLY_PRICE_ID_SPECIAL || ''
        },
        standard: {
            regular: ENV_CONFIG.STRIPE_STANDARD_PRICE_ID || '',
            discounted: ENV_CONFIG.STRIPE_STANDARD_DISCOUNT_PRICE_ID || ''
        },
        premium: {
            regular: ENV_CONFIG.STRIPE_PREMIUM_PRICE_ID || '',
            discounted: ENV_CONFIG.STRIPE_PREMIUM_DISCOUNT_PRICE_ID || ''
        }
    };

    constructor(
        private paymentService: PaymentService,
        private subscriptionRepository: SubscriptionRepository
    ) { }

    async execute(request: CreateCheckoutSessionRequest): Promise<CreateCheckoutSessionResponse> {
        const { mode = 'payment', successUrl, cancelUrl, metadata, planType, email, userId } = request;

        // Validate planType
        if (!planType) {
            throw new Error('planType is required');
        }

        const validPlanTypes = Object.keys(this.DISCOUNT_PRICES);
        if (!validPlanTypes.includes(planType)) {
            throw new Error(`Invalid planType. Must be one of: ${validPlanTypes.join(', ')}`);
        }

        // Check discount eligibility
        const { isEligible } = await this.getDiscountStatus();

        // Determine which price ID to use based on eligibility
        let finalPriceId = "";

        if (isEligible && planType && this.DISCOUNT_PRICES[planType as keyof typeof this.DISCOUNT_PRICES]) {
            finalPriceId = this.DISCOUNT_PRICES[planType as keyof typeof this.DISCOUNT_PRICES].discounted;
        } else if (planType && this.DISCOUNT_PRICES[planType as keyof typeof this.DISCOUNT_PRICES]) {
            finalPriceId = this.DISCOUNT_PRICES[planType as keyof typeof this.DISCOUNT_PRICES].regular;
        }

        // Validate that the price ID is configured
        if (!finalPriceId) {
            throw new Error(`Price ID for plan "${planType}" is not configured. Please set the corresponding STRIPE_*_PRICE_ID environment variable.`);
        }

        const subscription = await this.subscriptionRepository.findByUserId(userId);

        const sessionData = {
            priceId: finalPriceId,
            mode: mode as "payment" | "subscription",
            successUrl,
            cancelUrl,
            metadata: {
                ...metadata,
                email,
                userId,
                isDiscounted: isEligible ? 'true' : 'false',
                planType: planType || 'unknown'
            },
            customerId: subscription ? subscription.stripeCustomerId : null
        };

        const session = await this.paymentService.createCheckoutSession(sessionData);

        return {
            sessionId: session.id,
            isDiscounted: isEligible
        };
    }

    private async getDiscountStatus(): Promise<{ isEligible: boolean; remainingSpots: number; totalUsed: number }> {
        const allPayments = await this.subscriptionRepository.getAllAcivePayment();
        const totalUsed = allPayments.length;
        const remainingSpots = Math.max(0, this.DISCOUNT_LIMIT - totalUsed);
        const isEligible = totalUsed < this.DISCOUNT_LIMIT;

        return { isEligible, remainingSpots, totalUsed };
    }
}
