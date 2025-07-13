import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../../services/PaymentService';

export class PaymentController {
  async createPaymentIntent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { amount = 5000, currency = 'jpy' } = req.body; // ¥5000 default

      const paymentService = new PaymentService();
      const paymentIntent = await paymentService.createPaymentIntent(amount, currency, {
        description: 'Thrive in Japan LMS Access'
      });

      res.json({
        clientSecret: paymentIntent.clientSecret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      });
    } catch (error) {
      next(error);
    }
  }

  async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sig = req.headers['stripe-signature'] as string;
      const paymentService = new PaymentService();

      const event = paymentService.constructWebhookEvent(req.body, sig);

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        // Handle successful payment
        // This would trigger user creation in a real implementation
        console.log('Payment successful:', paymentIntent.id);
      }

      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  }

  async createCheckoutSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { priceId, mode = 'payment', successUrl, cancelUrl, metadata } = req.body;

      const paymentService = new PaymentService();
      const session = await paymentService.createCheckoutSession({
        priceId,
        mode,
        successUrl,
        cancelUrl,
        metadata,
      });

      res.json({ sessionId: session.id });
    } catch (error) {
      next(error);
    }
  }

  async verifyCheckoutSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.body;

      const paymentService = new PaymentService();
      const session = await paymentService.retrieveCheckoutSession(sessionId);

      if (!session) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      res.json({
        status: session.payment_status,
        paymentIntentId: session.payment_intent,
        customerEmail: session.customer_email,
        metadata: session.metadata,
      });
    } catch (error) {
      next(error);
    }
  }

}