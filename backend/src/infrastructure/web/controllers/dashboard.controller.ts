// backend/src/infrastructure/web/controllers/dashboard.controller.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { GetDashboardDataUseCase } from '../../../application/use-cases/dashboard/GetDashboardDataUseCase';
import { UserRepository } from '../../database/repositories/UserRepository';
import { ProfileRepository } from '../../database/repositories/ProfileRepository';
import { ProgressRepository } from '../../database/repositories/ProgressRepository';
import { CourseRepository } from '../../database/repositories/CourseRepository';
import { LessonRepository } from '../../database/repositories/LessonRepository';
import { PostRepository } from '../../database/repositories/PostRepository';
import { SessionRepository } from '../../database/repositories/SessionRepository';
import { BookingRepository } from '../../database/repositories/BookingRepository';
import { EnrollmentRepository } from '../../database/repositories/EnrollmentRepository';

export class DashboardController {
    async getDashboardData(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const getDashboardDataUseCase = new GetDashboardDataUseCase(
                new UserRepository(),
                new ProfileRepository(),
                new ProgressRepository(),
                new CourseRepository(),
                new LessonRepository(),
                new PostRepository(),
                new SessionRepository(),
                new BookingRepository(),
                new EnrollmentRepository()
            );

            const dashboardData = await getDashboardDataUseCase.execute({
                userId: req.user!.userId,
            });

            // Format dates for frontend
            const formattedData = {
                ...dashboardData,
                recentActivity: dashboardData.recentActivity.map(activity => ({
                    ...activity,
                    timestamp: activity.timestamp.toISOString(),
                })),
                upcomingSessions: dashboardData.upcomingSessions.map(session => ({
                    ...session,
                    scheduledAt: session.scheduledAt.toISOString(),
                })),
                achievements: dashboardData.achievements.map(achievement => ({
                    ...achievement,
                    earnedAt: achievement.earnedAt.toISOString(),
                })),
            };

            res.json(formattedData);
        } catch (error) {
            next(error);
        }
    }
}