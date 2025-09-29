import { BookingRepository } from "../../../infrastructure/database/repositories/BookingRepository";
import { ProfileRepository } from "../../../infrastructure/database/repositories/ProfileRepository";
import { SessionRepository } from "../../../infrastructure/database/repositories/SessionRepository";

export class CheckBookingEligibilityUseCase {
    constructor(
        private sessionRepository: SessionRepository,
        private bookingRepository: BookingRepository,
        private profileRepository: ProfileRepository
    ) { }

    async execute(params: {
        sessionId: string;
        userId: string;
    }) {
        const { sessionId, userId } = params;

        const session = await this.sessionRepository.findById(sessionId);
        if (!session) {
            throw new Error('Session not found');
        }

        const userBookings = await this.bookingRepository.findActiveByUserId(userId);
        const profile = await this.profileRepository.findByUserId(userId);

        const eligibility = {
            canBook: true,
            reasons: [] as string[],
            session: {
                id: session.id,
                title: session.title,
                pointsRequired: session.pointsRequired,
                spotsAvailable: session.maxParticipants - session.currentParticipants,
            },
            user: {
                points: profile?.points || 0,
                activeBookings: userBookings.length,
            },
        };

        const sessionStartTime = new Date(session.scheduledAt);
        const sessionEndTime = new Date(sessionStartTime.getTime() + session.duration * 60000);
        const isPast = sessionEndTime < new Date();

        // Check various conditions
        if (userBookings.find(b => b.sessionId === sessionId)) {
            eligibility.canBook = false;
            eligibility.reasons.push('Already booked this session');
        }

        if (userBookings.length >= 2) {
            eligibility.canBook = false;
            eligibility.reasons.push('Maximum active bookings reached (2)');
        }

        if (session.isFull()) {
            eligibility.canBook = false;
            eligibility.reasons.push('Session is full');
        }

        if (session.pointsRequired > 0 && (!profile || profile.points < session.pointsRequired)) {
            eligibility.canBook = false;
            eligibility.reasons.push(`Insufficient points (need ${session.pointsRequired}, have ${profile?.points || 0})`);
        }

        if (isPast) {
            eligibility.canBook = false;
            eligibility.reasons.push('Session has already started');
        }

        if (!session.isActive) {
            eligibility.canBook = false;
            eligibility.reasons.push('Session is not active');
        }

        return eligibility;
    }
}
