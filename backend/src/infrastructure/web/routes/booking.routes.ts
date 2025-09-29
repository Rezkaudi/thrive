import { Router } from 'express';
import { body } from 'express-validator';
import { BookingController } from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest';

const bookingRouter = (bookingController: BookingController): Router => {
  const router = Router();

  router.use(authenticate);

  router.post(
    '/',
    [body('sessionId').notEmpty()],
    validateRequest,
    bookingController.createBooking.bind(bookingController)
  );

  router.get('/my-bookings', bookingController.getMyBookings.bind(bookingController));
  router.delete('/:bookingId', bookingController.cancelBooking.bind(bookingController));

  return router;
};

export default bookingRouter;

