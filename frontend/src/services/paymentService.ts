// frontend/src/services/paymentService.ts
import api from './api';

export interface DiscountStatus {
    isEligible: boolean;
    remainingSpots: number;
    totalUsed: number;
    limit: number;
}

export interface CheckoutSessionResponse {
    sessionId: string;
    isDiscounted: boolean;
}

export const paymentService = {
    async checkDiscountStatus(): Promise<DiscountStatus> {
        const response = await api.get('/payment/discount-status');
        return response.data;
    },

    async createCheckoutSession(data: {
        planType: 'monthly' | 'yearly';
        mode: 'payment' | 'subscription';
        successUrl: string;
        cancelUrl: string;
        metadata?: any;
    }): Promise<CheckoutSessionResponse> {
        const response = await api.post('/payment/create-checkout-session', data);
        return response.data;
    },
};