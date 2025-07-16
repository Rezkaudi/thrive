import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';

const router = Router();
const paymentController = new PaymentController();

router.post('/create-payment-intent', paymentController.createPaymentIntent);
router.post('/webhook', paymentController.handleWebhook);
router.post('/create-checkout-session', paymentController.createCheckoutSession);
router.post('/verify-checkout-session', paymentController.verifyCheckoutSession);

export { router as paymentRouter };

// // src/infrastructure/web/middleware/validateRequest.ts
// import { Request, Response, NextFunction } from 'express';
// import { validationResult } from 'express-validator';

// export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     res.status(400).json({ errors: errors.array() });
//     return;
//   }
//   next();
// };