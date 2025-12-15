// backend/src/infrastructure/web/controllers/booking.controller.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { CreateBookingUseCase } from '../../../application/use-cases/booking/CreateBookingUseCase';
import { CancelBookingUseCase } from '../../../application/use-cases/booking/CancelBookingUseCase';
import { GetMyBookingsUseCase } from '../../../application/use-cases/booking/GetMyBookingsUseCase';

export class BookingController {
  constructor(
    private createBookingUseCase: CreateBookingUseCase,
    private getMyBookingsUseCase: GetMyBookingsUseCase,
    private cancelBookingUseCase: CancelBookingUseCase
  ) { }

  async createBooking(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.body;

      const booking = await this.createBookingUseCase.execute({
        userId: req.user!.userId,
        sessionId
      });

      res.status(201).json(booking);
    } catch (error) {
      next(error);
    }
  }

  async getMyBookings(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookings = await this.getMyBookingsUseCase.execute({
        userId: req.user!.userId
      });

      res.json(bookings);
    } catch (error) {
      next(error);
    }
  }

  async cancelBooking(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookingId } = req.params;

      await this.cancelBookingUseCase.execute({
        userId: req.user!.userId,
        bookingId
      });

      res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
      next(error);
    }
  }
}