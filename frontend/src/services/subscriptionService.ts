// frontend/src/services/subscriptionService.ts
import api from './api';

export interface SubscriptionStatus {
    hasAccessToCourses: boolean;
    hasSubscription: boolean;
    status: string | null;
    currentPlan: string | null;
    isTrialing: boolean;
    // Free trial state (no credit card)
    isInFreeTrial: boolean;
    freeTrialExpired: boolean;
    freeTrialEndDate: Date | null;
    trialConvertedToPaid: boolean;
    subscription: {
        id: string;
        plan: string;
        status: string;
        currentPeriodEnd: string;
    } | null;
}

export interface Subscription {
    id: string;
    userId: string;
    stripeCustomerId: string;
    stripeSubscriptionId?: string;
    stripePaymentIntentId?: string;
    subscriptionPlan: 'monthly' | 'yearly' | 'one-time' | 'standard' | 'premium';
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

    async createCustomerPortal(): Promise<any> {
        const response = await api.get(`/payment/create-customer-portal`);
        return response.data;
    },

    async endTrial(): Promise<void> {
        const response = await api.post(`/payment/end-trial`);
        return response.data;
    },
};