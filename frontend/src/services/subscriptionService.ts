// frontend/src/services/subscriptionService.ts
import api from './api';

export interface SubscriptionStatus {
    hasActiveSubscription: boolean;
    hasAccessToCourse: boolean;
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

    // async cancelSubscription(subscriptionId: string): Promise<void> {
    //     await api.post(`/subscriptions/${subscriptionId}/cancel`);
    // },

    // async reactivateSubscription(subscriptionId: string): Promise<void> {
    //     await api.post(`/subscriptions/${subscriptionId}/reactivate`);
    // },
};