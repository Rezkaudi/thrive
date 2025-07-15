// backend/src/infrastructure/web/controllers/payment.controller.ts
import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../../services/PaymentService';
import { PaymentRepository } from '../../database/repositories/PaymentRepository';
import { UserRepository } from '../../database/repositories/UserRepository';
import { Payment } from '../../../domain/repositories/IPaymentRepository';

export class PaymentController {
  private paymentRepository: PaymentRepository;
  private userRepository: UserRepository;
  private paymentService: PaymentService;

  constructor() {
    this.paymentRepository = new PaymentRepository();
    this.userRepository = new UserRepository();
    this.paymentService = new PaymentService();
  }

  createPaymentIntent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { amount = 5000, currency = 'jpy', email } = req.body;

      const metadata: any = {
        description: 'Thrive in Japan LMS Access'
      };

      // If email is provided, include it in metadata
      if (email) {
        metadata.email = email;
      }

      const paymentIntent = await this.paymentService.createPaymentIntent(amount, currency, metadata);

      res.json({
        clientSecret: paymentIntent.clientSecret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      });
    } catch (error) {
      next(error);
    }
  }

  createCheckoutSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { priceId, mode = 'payment', successUrl, cancelUrl, metadata } = req.body;

      // Ensure email is passed in the session metadata
      const sessionData = {
        priceId,
        mode,
        successUrl,
        cancelUrl,
        metadata: {
          ...metadata,
          // Make sure email is included if provided
          email: metadata?.email || req.body.email
        },
      };

      const session = await this.paymentService.createCheckoutSession(sessionData);

      res.json({ sessionId: session.id });
    } catch (error) {
      next(error);
    }
  }

  verifyCheckoutSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sessionId } = req.body;

      const session = await this.paymentService.retrieveCheckoutSession(sessionId);

      if (!session) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      res.json({
        status: session.payment_status,
        paymentIntentId: session.payment_intent,
        metadata: session.metadata,
      });
    } catch (error) {
      next(error);
    }
  }

  handleWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const sig = req.headers['stripe-signature'] as string;

    if (!sig) {
      res.status(400).json({ error: 'No stripe signature found' });
      return;
    }

    try {
      const event = this.paymentService.constructWebhookEvent(req.body, sig);
      console.log(`⚡ Webhook Event: ${event.type}`);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as any);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as any);
          break;

        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object as any);
          break;

        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as any);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as any);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as any);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error('❌ Webhook error:', error.message);
      res.status(400).json({ error: `Webhook Error: ${error.message}` });
    }
  };

  // Helper method to get email from customer
  private getEmailFromCustomer = async (customerId: string): Promise<string | null> => {
    try {
      const customer = await this.paymentService.retrieveCustomer(customerId);
      return customer?.email || null;
    } catch (error) {
      console.error('Error retrieving customer:', error);
      return null;
    }
  };

  private handlePaymentIntentSucceeded = async (paymentIntent: any): Promise<void> => {
    try {
      console.log('✅ payment_intent.succeeded:', paymentIntent.id);

      // Try to get email from metadata first
      let email = paymentIntent.metadata?.email;

      // If no email in metadata and we have a customer ID, get it from customer
      if (!email && paymentIntent.customer) {
        email = await this.getEmailFromCustomer(paymentIntent.customer);
      }

      const plan = paymentIntent.metadata?.plan || 'unknown';

      if (!email) {
        console.warn('⚠️ No email found in metadata or customer. Payment not recorded.');
        return;
      }

      const existingPayment = await this.paymentRepository.findByStripePaymentIntentId(paymentIntent.id);
      if (existingPayment) return;

      const payment: Payment = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
        email,
        stripePaymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount_received,
        currency: paymentIntent.currency,
        status: 'COMPLETED',
        metadata: {
          type: 'one-time',
          plan,
          email,
          description: paymentIntent.description || '',
          customerId: paymentIntent.customer || null,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.paymentRepository.create(payment);
      console.log(`💾 One-time payment recorded for ${email}: ${paymentIntent.id}`);
    } catch (error) {
      console.error('❌ Error in handlePaymentIntentSucceeded:', error);
      throw error;
    }
  };

  private handlePaymentIntentFailed = async (paymentIntent: any): Promise<void> => {
    try {
      console.log('❌ payment_intent.payment_failed:', paymentIntent.id);

      // Try to get email from metadata first
      let email = paymentIntent.metadata?.email;

      // If no email in metadata and we have a customer ID, get it from customer
      if (!email && paymentIntent.customer) {
        email = await this.getEmailFromCustomer(paymentIntent.customer);
      }

      const plan = paymentIntent.metadata?.plan || 'unknown';

      if (!email) {
        console.warn('⚠️ No email found. Failed payment not recorded.');
        return;
      }

      const existingPayment = await this.paymentRepository.findByStripePaymentIntentId(paymentIntent.id);
      if (existingPayment) return;

      const payment: Payment = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
        email,
        stripePaymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount || 0,
        currency: paymentIntent.currency,
        status: 'FAILED',
        metadata: {
          type: 'one-time',
          plan,
          email,
          failureCode: paymentIntent.last_payment_error?.code || 'unknown',
          failureMessage: paymentIntent.last_payment_error?.message || '',
          customerId: paymentIntent.customer || null,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.paymentRepository.create(payment);
      console.log(`💾 Failed payment recorded for ${email}: ${paymentIntent.id}`);
    } catch (error) {
      console.error('❌ Error in handlePaymentIntentFailed:', error);
      throw error;
    }
  };

  private handleCheckoutSessionCompleted = async (session: any): Promise<void> => {
    try {
      console.log('✅ checkout.session.completed:', session.id);

      // Try to get email from session metadata first
      let email = session.metadata?.email;

      // If no email in metadata, try customer email from session
      if (!email && session.customer_email) {
        email = session.customer_email;
      }

      // If still no email and we have a customer ID, get it from customer
      if (!email && session.customer) {
        email = await this.getEmailFromCustomer(session.customer);
      }

      const plan = session.metadata?.plan || 'unknown';

      if (!email || !session.payment_intent) {
        console.warn('⚠️ No email or payment intent found. Session not recorded.');
        return;
      }

      const existingPayment = await this.paymentRepository.findByStripePaymentIntentId(session.payment_intent);
      if (existingPayment) return;

      const payment: Payment = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
        email,
        stripePaymentIntentId: session.payment_intent,
        amount: session.amount_total,
        currency: session.currency,
        status: 'COMPLETED',
        metadata: {
          type: 'checkout-session',
          plan,
          email,
          sessionId: session.id,
          customerId: session.customer,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.paymentRepository.create(payment);
      console.log(`💾 Checkout session payment recorded for ${email}: ${session.payment_intent}`);
    } catch (error) {
      console.error('❌ Error in handleCheckoutSessionCompleted:', error);
      throw error;
    }
  };

  private handleSubscriptionCreated = async (subscription: any): Promise<void> => {
    try {
      console.log('🟢 customer.subscription.created:', subscription.id);

      // For subscriptions, the email is usually not in subscription metadata
      // We need to get it from the customer object
      let email = subscription.metadata?.email;

      if (!email && subscription.customer) {
        email = await this.getEmailFromCustomer(subscription.customer);
      }

      const plan = subscription.metadata?.plan || subscription.items.data[0]?.price.nickname || 'unknown';

      console.log("Subscription email:", email);

      if (!email) {
        console.warn('⚠️ No email found for subscription. Not recorded.');
        return;
      }

      const existingPayment = await this.paymentRepository.findByStripePaymentIntentId(subscription.id);
      if (existingPayment) return;

      const payment: Payment = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
        email,
        stripePaymentIntentId: subscription.id,
        amount: subscription.items.data[0]?.price.unit_amount || 0,
        currency: subscription.currency,
        status: subscription.status === 'active' ? 'COMPLETED' : 'PENDING',
        metadata: {
          type: 'subscription',
          plan,
          email,
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          priceId: subscription.items.data[0]?.price.id,
          interval: subscription.items.data[0]?.price.recurring?.interval,
          currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.paymentRepository.create(payment);
      console.log(`💾 Subscription created for ${email}: ${subscription.id}`);
    } catch (error) {
      console.error('❌ Error in handleSubscriptionCreated:', error);
      throw error;
    }
  };

  private handleSubscriptionUpdated = async (subscription: any): Promise<void> => {
    try {
      console.log('🔄 customer.subscription.updated:', subscription.id);

      const existingPayment = await this.paymentRepository.findByStripePaymentIntentId(subscription.id);
      if (!existingPayment) {
        // If payment doesn't exist, we might need to create it
        // This can happen if the subscription was created outside of our system
        await this.handleSubscriptionCreated(subscription);
        return;
      }

      existingPayment.status =
        subscription.status === 'active'
          ? 'COMPLETED'
          : subscription.status === 'canceled'
            ? 'FAILED'
            : 'PENDING';

      existingPayment.metadata = {
        ...existingPayment.metadata,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      };

      existingPayment.updatedAt = new Date();

      await this.paymentRepository.update(existingPayment);
      console.log(`📝 Subscription updated: ${subscription.id}`);
    } catch (error) {
      console.error('❌ Error in handleSubscriptionUpdated:', error);
      throw error;
    }
  };

  private handleSubscriptionDeleted = async (subscription: any): Promise<void> => {
    try {
      console.log('⛔ customer.subscription.deleted:', subscription.id);

      const existingPayment = await this.paymentRepository.findByStripePaymentIntentId(subscription.id);
      if (!existingPayment) {
        console.warn('⚠️ No existing payment found for deleted subscription:', subscription.id);
        return;
      }

      existingPayment.status = 'FAILED';
      existingPayment.metadata = {
        ...existingPayment.metadata,
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        endedAt: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null,
      };
      existingPayment.updatedAt = new Date();

      await this.paymentRepository.update(existingPayment);
      console.log(`🗑️ Subscription cancelled: ${subscription.id}`);
    } catch (error) {
      console.error('❌ Error in handleSubscriptionDeleted:', error);
      throw error;
    }
  };
}