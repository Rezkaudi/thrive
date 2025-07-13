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
  async createCheckoutSession(params: {
    priceId: string;
    mode: 'payment' | 'subscription';
    successUrl: string;
    cancelUrl: string;
    metadata?: any;
  }): Promise<Stripe.Checkout.Session> {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      mode: params.mode,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: params.metadata,
    });

    return session;
  }

  async retrieveCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session | null> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      return session;
    } catch (error) {
      return null;
    }
  }
}
