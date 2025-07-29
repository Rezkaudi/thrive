// frontend/src/services/subscriptionService.ts
import api from './api';

export interface SubscriptionStatus {
    hasActiveSubscription: boolean;
    hasTrailingSubscription: boolean;
    hasAccessToCourse: boolean;
    status: string | null
    subscriptions: {
        id: string;
        plan: string;
        status: string;
        expiresAt: string;
        courseId?: string;
    }[];
}

export interface Subscription {
    id: string;
    userId: string;
    stripeCustomerId: string;
    stripeSubscriptionId?: string;
    stripePaymentIntentId?: string;
    subscriptionPlan: 'monthly' | 'yearly' | 'one-time';
    status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
    currentPeriodStart: string;
    currentPeriodEnd: string;
    createdAt: string;
    updatedAt: string;
}

export const subscriptionService = {
    async checkSubscriptionStatus(): Promise<SubscriptionStatus> {
        const response = await api.get('/subscriptions/check', {});
        return response.data;
    },

    async getMySubscriptions(): Promise<Subscription[]> {
        const response = await api.get('/subscriptions/my-subscriptions');
        return response.data;
    },

    async createCustomerPortal(): Promise<any> {
        const response = await api.get(`/payment/create-customer-portal`);
        return response.data;

    },

    async endTrial(): Promise<void> {
        const response = await api.post(`/payment/end-trial`);
        return response.data;
    },
};