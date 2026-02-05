import { PaymentService } from "../../../infrastructure/services/PaymentService";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";

export interface VerifyCheckoutSessionRequest {
    sessionId: string;
}

export interface VerifyCheckoutSessionResponse {
    status: string;
    paymentIntentId: any;
    metadata: any;
    transactionDetails: {
        transactionId: string;
        name: string;
        value: number;
        currency: string;
        plan: string;
        subscriptionId: string;
        customerId: string;
        isTrial: boolean;
        interval: string;
    };
    // New fields for trial conversion analytics
    trialConversion: {
        wasInFreeTrial: boolean;
        isFirstConversion: boolean; // Only true if this is the FIRST time converting
    };
}

export class VerifyCheckoutSessionUseCase {
    constructor(
        private paymentService: PaymentService,
        private userRepository?: IUserRepository
    ) { }

    async execute(request: VerifyCheckoutSessionRequest): Promise<VerifyCheckoutSessionResponse> {
        const { sessionId } = request;

        const session = await this.paymentService.retrieveCheckoutSession(sessionId);

        if (!session) {
            throw new Error('Session not found');
        }

        const planType = session.metadata?.planType || 'unknown_plan';
        const planName = `Thrive ${planType.charAt(0).toUpperCase() + planType.slice(1)} Subscription`;
        const isTrial = session.total_details?.amount_tax === 0 && session.amount_total === 0;

        let finalValue = session.amount_total || 0;

        if (finalValue === 0) {
            if (session.line_items?.data?.[0]?.price?.unit_amount) {
                finalValue = session.line_items.data[0].price.unit_amount;
            }
        }

        // Check trial conversion status
        let wasInFreeTrial = false;
        let isFirstConversion = false;

        const userId = session.metadata?.userId;
        if (userId && this.userRepository) {
            const user = await this.userRepository.findById(userId);
            if (user) {
                // User was in free trial if they had trial dates set
                wasInFreeTrial = user.trialStartDate !== null && user.trialEndDate !== null;

                // Check if this is the first conversion
                // The webhook already set trialConvertedToPaid=true if this was a conversion
                // So isFirstConversion should only be true if user just converted
                // We track this by checking if they had a trial AND trialConvertedToPaid is now true
                // BUT we need to detect if this specific payment is the conversion
                // Since webhook sets it, we check if the payment is not a trial (isTrial=false)
                // and user was in trial before
                isFirstConversion = wasInFreeTrial && !isTrial && user.trialConvertedToPaid;
            }
        }

        return {
            status: session.payment_status,
            paymentIntentId: session.payment_intent,
            metadata: session.metadata,
            transactionDetails: {
                transactionId: session.id,
                name: planName,
                value: finalValue,
                currency: session.currency?.toUpperCase() || 'JPY',
                plan: planType,
                subscriptionId: session.subscription as string || 'sub_pending',
                customerId: session.customer as string || 'cus_guest',
                isTrial: isTrial,
                interval: session.metadata?.interval || 'monthly'
            },
            trialConversion: {
                wasInFreeTrial,
                isFirstConversion,
            }
        };
    }
}