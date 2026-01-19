// frontend/src/services/paymentService.ts
import api from './api';

export interface DiscountStatus {
    isEligible: boolean;
    remainingSpots: number;
    totalUsed: number;
    limit: number;
}

export interface CheckoutSessionResponse {
    sessionId?: string;
    isDiscounted: boolean;
    isUpgrade?: boolean;
    isDowngrade?: boolean;
    upgraded?: boolean;
    isPaidNow?: boolean;
    message?: string;
}

export const paymentService = {
    async checkDiscountStatus(): Promise<DiscountStatus> {
        const response = await api.get('/payment/discount-status');
        return response.data;
    },

    async createCheckoutSession(data: {
        planType: 'monthly' | 'yearly' | 'monthlySpecial' | 'standard' | 'premium';
        mode: 'payment' | 'subscription';
        successUrl: string;
        cancelUrl: string;
        metadata?: any;
        hasTrial?: boolean;
    }): Promise<CheckoutSessionResponse> {
        const response = await api.post('/payment/create-checkout-session', {
            ...data,
            metadata: {
                ...data.metadata,
                hasTrial: data.hasTrial ?? true,
            },
        });
        return response.data;
    },
};