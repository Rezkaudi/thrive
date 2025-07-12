import Stripe from 'stripe';
import { IPaymentService, PaymentIntent } from '../../application/services/IPaymentService';

export class PaymentService implements IPaymentService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-06-30.basil'
    });
  }

  async createPaymentIntent(amount: number, currency: string, metadata?: any): Promise<PaymentIntent> {
    const intent = await this.stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      id: intent.id,
      amount: intent.amount,
      currency: intent.currency,
      status: intent.status,
      clientSecret: intent.client_secret!
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<boolean> {
    const intent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    return intent.status === 'succeeded';
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<PaymentIntent | null> {
    try {
      const intent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return {
        id: intent.id,
        amount: intent.amount,
        currency: intent.currency,
        status: intent.status,
        clientSecret: intent.client_secret!
      };
    } catch (error) {
      return null;
    }
  }

  async createCustomer(email: string): Promise<string> {
    const customer = await this.stripe.customers.create({ email });
    return customer.id;
  }

  async attachPaymentMethod(customerId: string, paymentMethodId: string): Promise<void> {
    await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
  }

  constructWebhookEvent(payload: Buffer | string, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  }
}
