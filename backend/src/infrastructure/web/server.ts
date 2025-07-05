import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './routes/auth.routes';
import { userRouter } from './routes/user.routes';
import { courseRouter } from './routes/course.routes';
import { communityRouter } from './routes/community.routes';
import { bookingRouter } from './routes/booking.routes';
import { adminRouter } from './routes/admin.routes';
import { profileRouter } from './routes/profile.routes';
import { paymentRouter } from './routes/payment.routes';
import { calendarRouter } from './routes/calendar.routes';
import { sessionRouter } from './routes/session.routes';
import { setupSwagger } from './swagger/swagger.setup';

export class Server {
  private app: Application;
  private port: number;

  constructor(port: number) {
    this.app = express();
    this.port = port;
    this.configureMiddleware();
    this.configureRoutes();
    this.configureSwagger();
    this.configureErrorHandling();
  }

  private configureMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.FRONTEND_URL,
      credentials: true
    }));
    this.app.use(compression());
    this.app.use(morgan('dev'));

    // Raw body for Stripe webhooks
    this.app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private configureRoutes(): void {
    // Static files
    this.app.use('/uploads', express.static('uploads'));

    // API routes
    this.app.use('/api/auth', authRouter);
    this.app.use('/api/users', userRouter);
    this.app.use('/api/profile', profileRouter);
    this.app.use('/api/courses', courseRouter);
    this.app.use('/api/community', communityRouter);
    this.app.use('/api/bookings', bookingRouter);
    this.app.use('/api/payment', paymentRouter);
    this.app.use('/api/admin', adminRouter);
    this.app.use('/api/calendar', calendarRouter);
    this.app.use('/api/sessions', sessionRouter);

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });
  }

  private configureErrorHandling(): void {
    this.app.use(errorHandler);
  }

  private configureSwagger(): void {
    setupSwagger(this.app);
  }

  public async start(): Promise<void> {
    this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
      console.log(`API Documentation available at http://localhost:${this.port}/docs`);
    });
  }

  public getApp(): Application {
    return this.app;
  }
}