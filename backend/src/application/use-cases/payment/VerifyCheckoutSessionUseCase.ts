import { PaymentService } from "../../../infrastructure/services/PaymentService";

export interface VerifyCheckoutSessionRequest {
    sessionId: string;
}

export interface VerifyCheckoutSessionResponse {
    status: string;
    paymentIntentId: any;
    metadata: any;
}

export class VerifyCheckoutSessionUseCase {
    constructor(private paymentService: PaymentService) { }

    async execute(request: VerifyCheckoutSessionRequest): Promise<VerifyCheckoutSessionResponse> {
        const { sessionId } = request;

        const session = await this.paymentService.retrieveCheckoutSession(sessionId);

        if (!session) {
            throw new Error('Session not found');
        }

        return {
            status: session.payment_status,
            paymentIntentId: session.payment_intent,
            metadata: session.metadata,
        };
    }
}