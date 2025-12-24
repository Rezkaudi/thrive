// backend/src/infrastructure/services/BookingValidationService.ts

import { IBookingValidationService, BookingValidationResult, BookingLimitsInfo } from '../../domain/services/IBookingValidationService';
import { ISessionRepository } from '../../domain/repositories/ISessionRepository';
import { IBookingRepository } from '../../domain/repositories/IBookingRepository';
import { ISubscriptionRepository } from '../../domain/repositories/ISubscriptionRepository';
import { IProfileRepository } from '../../domain/repositories/IProfileRepository';
import { SessionType } from '../../domain/entities/Session';
import { SubscriptionPlan } from '../../domain/entities/Subscription';

export class BookingValidationService implements IBookingValidationService {
  // Business rule constants
  public readonly STANDARD_PLAN_MONTHLY_LIMIT = 4;
  public readonly STANDARD_PLAN_ACTIVE_LIMIT = 4;
  public readonly PREMIUM_PLAN_ACTIVE_LIMIT = 2;
  public readonly MINIMUM_HOURS_NOTICE = 24;

  constructor(
    private sessionRepository: ISessionRepository,
    private bookingRepository: IBookingRepository,
    private subscriptionRepository: ISubscriptionRepository,
    private profileRepository: IProfileRepository
  ) { }

  /**
   * Determines if a subscription plan is considered "Standard"
   * Standard plans include: 'standard' only
   */
  private isStandardPlan(plan: SubscriptionPlan): boolean {
    return plan === 'standard';
  }

  /**
   * Determines if a subscription plan is "Premium"
   * Premium plans include: 'premium', 'monthly', 'yearly', 'one-time'
   */
  private isPremiumPlan(plan: SubscriptionPlan): boolean {
    return ['premium', 'monthly', 'yearly'].includes(plan);
  }

  /**
   * Gets the maximum active bookings allowed for a plan
   */
  private getMaxActiveBookings(plan: SubscriptionPlan): number {
    if (this.isPremiumPlan(plan)) {
      return this.PREMIUM_PLAN_ACTIVE_LIMIT;
    }
    return this.STANDARD_PLAN_ACTIVE_LIMIT;
  }

  /**
   * Gets the monthly booking limit for a plan (null = unlimited)
   */
  private getMonthlyLimit(plan: SubscriptionPlan): number | null {
    if (this.isPremiumPlan(plan)) {
      return null; // No monthly limit for premium
    }
    return this.STANDARD_PLAN_MONTHLY_LIMIT;
  }

  /**
   * Checks if a plan can access a specific session type
   */
  private canAccessSessionType(plan: SubscriptionPlan, sessionType: SessionType): boolean {
    // Premium users can access all session types
    if (this.isPremiumPlan(plan)) {
      return true;
    }

    // Standard users can only access STANDARD sessions
    return sessionType === SessionType.STANDARD;
  }

  /**
   * Gets the current month string in YYYY-MM format
   * Uses UTC to ensure consistency across timezones
   */
  private getCurrentMonthString(): string {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = (now.getUTCMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * Gets month string in YYYY-MM format for a given date
   */
  private getMonthString(date: Date): string {
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * Calculates hours until a session starts
   */
  private getHoursUntilSession(scheduledAt: Date): number {
    const now = new Date();
    return (scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60);
  }

  /**
   * Gets booking limits information for a user
   */
  async getBookingLimits(userId: string): Promise<BookingLimitsInfo> {
    // Get user's subscription
    const subscription = await this.subscriptionRepository.findActiveByUserId(userId);

    if (!subscription) {
      return {
        userPlan: null,
        hasActiveSubscription: false,
        activeBookingsCount: 0,
        maxActiveBookings: 0,
        activeBookingsRemaining: 0,
        monthlyBookingCount: 0,
        monthlyBookingLimit: null,
        remainingMonthlyBookings: null,
        currentMonth: this.getCurrentMonthString()
      };
    }

    const userPlan = subscription.subscriptionPlan;
    const maxActiveBookings = this.getMaxActiveBookings(userPlan);
    const monthlyLimit = this.getMonthlyLimit(userPlan);

    // Get active bookings
    const activeBookings = await this.bookingRepository.findActiveByUserId(userId);
    const activeBookingsCount = activeBookings.length;
    const activeBookingsRemaining = Math.max(0, maxActiveBookings - activeBookingsCount);

    // Get monthly booking count (for standard plan)
    const now = new Date();
    const monthlyBookingCount = await this.bookingRepository.countMonthlyStandardSessionBookings(
      userId,
      now.getUTCFullYear(),
      now.getUTCMonth() + 1
    );

    const remainingMonthlyBookings = monthlyLimit !== null
      ? Math.max(0, monthlyLimit - monthlyBookingCount)
      : null;

    return {
      userPlan,
      hasActiveSubscription: true,
      activeBookingsCount,
      maxActiveBookings,
      activeBookingsRemaining,
      monthlyBookingCount,
      monthlyBookingLimit: monthlyLimit,
      remainingMonthlyBookings,
      currentMonth: this.getCurrentMonthString()
    };
  }

  /**
   * Comprehensive booking validation
   * Returns detailed validation result with all check statuses
   */
  async validateBooking(params: {
    userId: string;
    sessionId: string;
  }): Promise<BookingValidationResult> {
    const { userId, sessionId } = params;
    const reasons: string[] = [];

    // Fetch all required data
    const [session, subscription, activeBookings, profile] = await Promise.all([
      this.sessionRepository.findById(sessionId),
      this.subscriptionRepository.findActiveByUserId(userId),
      this.bookingRepository.findActiveByUserId(userId),
      this.profileRepository.findByUserId(userId)
    ]);

    // Session must exist
    if (!session) {
      return {
        canBook: false,
        reasons: ['Session not found'],
        validationDetails: this.getEmptyValidationDetails()
      };
    }

    // Initialize validation details
    const now = new Date();
    const hoursUntilSession = this.getHoursUntilSession(session.scheduledAt);
    const sessionEndTime = new Date(session.scheduledAt.getTime() + session.duration * 60000);
    const isPast = sessionEndTime < now;

    // Check subscription
    const hasActiveSubscription = subscription !== null;
    const userPlan = subscription?.subscriptionPlan || null;

    if (!hasActiveSubscription) {
      reasons.push('Active subscription required to book sessions');
    }

    // Calculate limits based on plan
    const maxActiveBookings = userPlan ? this.getMaxActiveBookings(userPlan) : 0;
    const monthlyLimit = userPlan ? this.getMonthlyLimit(userPlan) : null;
    const activeBookingsCount = activeBookings.length;
    const activeBookingsRemaining = Math.max(0, maxActiveBookings - activeBookingsCount);

    // Get monthly booking count for the SESSION'S month (not current month)
    // This allows booking sessions in future months even if current month limit is exhausted
    const sessionMonth = session.scheduledAt.getUTCMonth() + 1;
    const sessionYear = session.scheduledAt.getUTCFullYear();
    const sessionMonthString = this.getMonthString(session.scheduledAt);

    const monthlyBookingCount = await this.bookingRepository.countMonthlyStandardSessionBookings(
      userId,
      sessionYear,
      sessionMonth
    );

    const remainingMonthlyBookings = monthlyLimit !== null
      ? Math.max(0, monthlyLimit - monthlyBookingCount)
      : null;

    // Check if already booked
    const isAlreadyBooked = activeBookings.some(b => b.sessionId === sessionId);
    if (isAlreadyBooked) {
      reasons.push('You have already booked this session');
    }

    // Check 24-hour rule
    const meetsMinimumNotice = hoursUntilSession >= this.MINIMUM_HOURS_NOTICE;
    if (!meetsMinimumNotice && !isPast) {
      reasons.push(`Sessions must be booked at least ${this.MINIMUM_HOURS_NOTICE} hours in advance. This session starts in ${Math.floor(hoursUntilSession)} hours.`);
    }

    // Check if session is past
    if (isPast) {
      reasons.push('This session has already ended');
    }

    // Check if session is active
    const isSessionActive = session.isActive;
    if (!isSessionActive) {
      reasons.push('This session is not currently active');
    }

    // Check available spots
    const spotsAvailable = session.maxParticipants - session.currentParticipants;
    if (spotsAvailable <= 0) {
      reasons.push('This session is full');
    }

    // Check points requirement
    const hasEnoughPoints = session.pointsRequired <= 0 ||
      (profile !== null && profile.points >= session.pointsRequired);
    if (!hasEnoughPoints) {
      const userPoints = profile?.points || 0;
      reasons.push(`Insufficient points. Required: ${session.pointsRequired}, Available: ${userPoints}`);
    }

    // Plan-specific validations (only if user has subscription)
    let canAccessSessionType = false;

    if (hasActiveSubscription && userPlan) {
      // Check session type access
      canAccessSessionType = this.canAccessSessionType(userPlan, session.type);
      if (!canAccessSessionType) {
        const planName = this.isStandardPlan(userPlan) ? 'Standard' : userPlan;
        reasons.push(
          `Your ${planName} plan can only access Standard sessions. ` +
          `Upgrade to Premium for access to ${session.type} sessions.`
        );
      }

      // Check active bookings limit
      if (activeBookingsCount >= maxActiveBookings) {
        reasons.push(
          `Maximum active bookings reached (${maxActiveBookings}). ` +
          `Please wait for a session to complete or cancel an existing booking.`
        );
      }

      // Check monthly limit (Standard plan only) - for the SESSION's month
      if (this.isStandardPlan(userPlan) && monthlyLimit !== null) {
        if (monthlyBookingCount >= monthlyLimit) {
          const sessionMonthName = session.scheduledAt.toLocaleString('default', { month: 'long', year: 'numeric' });
          reasons.push(
            `Monthly booking limit reached (${monthlyLimit} sessions for ${sessionMonthName}). ` +
            `You can still book sessions in other months.`
          );
        }
      }
    }

    // Compile validation result
    const canBook = reasons.length === 0;

    return {
      canBook,
      reasons,
      validationDetails: {
        userPlan,
        hasActiveSubscription,
        activeBookingsCount,
        maxActiveBookings,
        activeBookingsRemaining,
        monthlyBookingCount,
        monthlyBookingLimit: monthlyLimit,
        remainingMonthlyBookings,
        currentMonth: this.getCurrentMonthString(),
        sessionMonth: sessionMonthString,
        hoursUntilSession,
        meetsMinimumNotice,
        canAccessSessionType,
        sessionType: session.type,
        hasEnoughPoints,
        spotsAvailable,
        isSessionActive,
        isAlreadyBooked
      }
    };
  }

  /**
   * Returns empty validation details for error cases
   */
  private getEmptyValidationDetails() {
    return {
      userPlan: null,
      hasActiveSubscription: false,
      activeBookingsCount: 0,
      maxActiveBookings: 0,
      activeBookingsRemaining: 0,
      monthlyBookingCount: 0,
      monthlyBookingLimit: null,
      remainingMonthlyBookings: null,
      currentMonth: this.getCurrentMonthString(),
      sessionMonth: this.getCurrentMonthString(),
      hoursUntilSession: 0,
      meetsMinimumNotice: false,
      canAccessSessionType: false,
      sessionType: SessionType.STANDARD,
      hasEnoughPoints: false,
      spotsAvailable: 0,
      isSessionActive: false,
      isAlreadyBooked: false
    };
  }
}
