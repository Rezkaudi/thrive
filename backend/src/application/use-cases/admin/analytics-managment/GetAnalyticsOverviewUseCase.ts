import { UserRepository } from "../../../../infrastructure/database/repositories/UserRepository";
import { ProfileRepository } from "../../../../infrastructure/database/repositories/ProfileRepository";
import { ProgressRepository } from "../../../../infrastructure/database/repositories/ProgressRepository";
import { CourseRepository } from "../../../../infrastructure/database/repositories/CourseRepository";
import { LessonRepository } from "../../../../infrastructure/database/repositories/LessonRepository";

export class GetAnalyticsOverviewUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly profileRepository: ProfileRepository,
        private readonly progressRepository: ProgressRepository,
        private readonly courseRepository: CourseRepository,
        private readonly lessonRepository: LessonRepository
    ) { }

    async execute() {
        try {
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

            const allUsers = await this.userRepository.findAll();
            const totalUsers = allUsers.length;
            const activeUsers = allUsers.filter(item => item.isActive).length;

            const recentUsers = allUsers.filter(user =>
                new Date(user.createdAt) >= thirtyDaysAgo
            ).length;

            const previousPeriodStart = new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000);
            const previousPeriodUsers = allUsers.filter(user => {
                const userDate = new Date(user.createdAt);
                return userDate >= previousPeriodStart && userDate < thirtyDaysAgo;
            }).length;

            const userGrowth = previousPeriodUsers > 0
                ? Math.round(((recentUsers - previousPeriodUsers) / previousPeriodUsers) * 100)
                : 0;

            let totalCompletionRate = 0;
            try {
                const allProfiles = await this.profileRepository.findAll();
                const courses = await this.courseRepository.findAll(true);

                if (allProfiles.length > 0 && courses.length > 0) {
                    let totalProgressSum = 0;
                    let userCount = 0;

                    for (const profile of allProfiles) {
                        for (const course of courses) {
                            const progress = await this.progressRepository.findByUserAndCourse(profile.userId, course.id);
                            const lessons = await this.lessonRepository.findByCourseId(course.id);

                            if (lessons.length > 0) {
                                const completedLessons = progress.filter(p => p.isCompleted).length;
                                const courseCompletion = (completedLessons / lessons.length) * 100;
                                totalProgressSum += courseCompletion;
                                userCount++;
                            }
                        }
                    }

                    if (userCount > 0) {
                        totalCompletionRate = Math.round(totalProgressSum / userCount);
                    }
                }
            } catch (error) {
                console.warn('Error calculating completion rate:', error);
            }

            let monthlyRevenue = 0;
            let revenueGrowth = 0;

            return {
                totalUsers,
                activeUsers,
                monthlyRevenue,
                completionRate: totalCompletionRate,
                userGrowth,
                revenueGrowth,
                pendingReviews: 0
            };
        } catch (error) {
            console.error('Error in getAnalyticsOverview:', error);
        }
    }
}