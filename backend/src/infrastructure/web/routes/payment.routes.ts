import express, { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';

const router = Router();
const paymentController = new PaymentController();

router.post(
    '/webhook',
    express.raw({ type: 'application/json' }),
    paymentController.handleWebhook
);

router.post('/create-payment-intent', paymentController.createPaymentIntent);
router.post('/create-checkout-session', paymentController.createCheckoutSession);
router.post('/verify-checkout-session', paymentController.verifyCheckoutSession);

export { router as paymentRouter };