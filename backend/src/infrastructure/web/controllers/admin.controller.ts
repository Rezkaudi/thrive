import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserRepository } from '../../database/repositories/UserRepository';
import { ProfileRepository } from '../../database/repositories/ProfileRepository';
import { PostRepository } from '../../database/repositories/PostRepository';
import { CourseRepository } from '../../database/repositories/CourseRepository';
import { LessonRepository } from '../../database/repositories/LessonRepository';
import { SessionRepository } from '../../database/repositories/SessionRepository';
import { KeywordRepository } from '../../database/repositories/KeywordRepository';
import { ManagePointsUseCase } from '../../../application/use-cases/admin/ManagePointsUseCase';
import { CreatePostUseCase } from '../../../application/use-cases/community/CreatePostUseCase';
import { Course, CourseType } from '../../../domain/entities/Course';
import { Session, SessionType } from '../../../domain/entities/Session';
import { Lesson, LessonType } from '../../../domain/entities/Lesson';
import { Keyword } from '../../../domain/entities/Keyword';

export class AdminController {
  async getUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20 } = req.query;
      const userRepository = new UserRepository();
      const profileRepository = new ProfileRepository();
      
      const users = await userRepository.findAll();
      const profiles = await profileRepository.findAll();
      
      const usersWithProfiles = users.map(user => {
        const profile = profiles.find(p => p.userId === user.id);
        return {
          ...user,
          profile
        };
      });

      res.json({
        users: usersWithProfiles,
        total: users.length,
        page: Number(page),
        totalPages: Math.ceil(users.length / Number(limit))
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;
      
      const userRepository = new UserRepository();
      const user = await userRepository.findById(userId);
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      user.isActive = isActive;
      user.updatedAt = new Date();
      await userRepository.update(user);

      res.json({ message: 'User status updated' });
    } catch (error) {
      next(error);
    }
  }

  async adjustUserPoints(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const { points, reason } = req.body;

      const managePointsUseCase = new ManagePointsUseCase(
        new ProfileRepository(),
        new UserRepository()
      );

      await managePointsUseCase.execute({
        adminId: req.user!.userId,
        targetUserId: userId,
        points,
        reason
      });

      res.json({ message: 'Points adjusted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getFlaggedPosts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const postRepository = new PostRepository();
      // In a real implementation, you would filter by flagged status
      const { posts } = await postRepository.findAll();
      res.json(posts);
    } catch (error) {
      next(error);
    }
  }

  async deletePost(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { postId } = req.params;
      const postRepository = new PostRepository();
      
      const deleted = await postRepository.delete(postId);
      if (!deleted) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      res.json({ message: 'Post deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async unflagPost(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { postId } = req.params;
      // Implement unflag logic
      res.json({ message: 'Post unflagged successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createCourse(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, description, type, icon } = req.body;
      const courseRepository = new CourseRepository();

      const course = new Course(
        `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
        title,
        description,
        type as CourseType,
        icon,
        true,
        new Date(),
        new Date()
      );

      const saved = await courseRepository.create(course);
      res.status(201).json(saved);
    } catch (error) {
      next(error);
    }
  }

  async updateCourse(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId } = req.params;
      const updates = req.body;
      
      const courseRepository = new CourseRepository();
      const course = await courseRepository.findById(courseId);
      
      if (!course) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      Object.assign(course, updates);
      course.updatedAt = new Date();
      
      const updated = await courseRepository.update(course);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }

  async deleteCourse(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId } = req.params;
      const courseRepository = new CourseRepository();
      
      const deleted = await courseRepository.delete(courseId);
      if (!deleted) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      res.json({ message: 'Course deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createLesson(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId } = req.params;
      const { 
        title, 
        description, 
        order, 
        lessonType, 
        contentUrl,
        contentData,
        audioFiles, 
        resources, 
        requiresReflection, 
        pointsReward,
        passingScore,
        keywords 
      } = req.body;
      
      const lessonRepository = new LessonRepository();
      const keywordRepository = new KeywordRepository();

      const lesson = new Lesson(
        `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
        courseId,
        title,
        description,
        order,
        lessonType || LessonType.VIDEO,
        contentUrl,
        contentData,
        audioFiles || [],
        resources || [],
        requiresReflection || false,
        pointsReward || 0,
        passingScore,
        new Date(),
        new Date()
      );

      const savedLesson = await lessonRepository.create(lesson);

      // If lesson type is KEYWORDS and keywords are provided, save them
      if (lessonType === LessonType.KEYWORDS && keywords && Array.isArray(keywords)) {
        const keywordEntities = keywords.map((kw: any, index: number) => new Keyword(
          `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
          savedLesson.id,
          kw.englishText,
          kw.japaneseText,
          kw.englishAudioUrl,
          kw.japaneseAudioUrl,
          index + 1,
          new Date(),
          new Date()
        ));

        await keywordRepository.createMany(keywordEntities);
      }

      res.status(201).json(savedLesson);
    } catch (error) {
      console.error('Error in createLesson:', error);
      next(error);
    }
  }

  async updateLesson(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { lessonId } = req.params;
      const updates = req.body;
      
      const lessonRepository = new LessonRepository();
      const keywordRepository = new KeywordRepository();
      
      const lesson = await lessonRepository.findById(lessonId);
      
      if (!lesson) {
        res.status(404).json({ error: 'Lesson not found' });
        return;
      }

      // If updating a KEYWORDS lesson, handle keywords update
      if (lesson.lessonType === LessonType.KEYWORDS && updates.keywords) {
        // Delete existing keywords
        await keywordRepository.deleteByLessonId(lessonId);
        
        // Create new keywords
        if (Array.isArray(updates.keywords) && updates.keywords.length > 0) {
          const keywordEntities = updates.keywords.map((kw: any, index: number) => new Keyword(
            `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
            lessonId,
            kw.englishText,
            kw.japaneseText,
            kw.englishAudioUrl,
            kw.japaneseAudioUrl,
            index + 1,
            new Date(),
            new Date()
          ));

          await keywordRepository.createMany(keywordEntities);
        }
        
        // Remove keywords from updates to avoid trying to save them to lesson
        delete updates.keywords;
      }

      Object.assign(lesson, updates);
      lesson.updatedAt = new Date();
      
      const updated = await lessonRepository.update(lesson);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }

  async deleteLesson(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { lessonId } = req.params;
      const lessonRepository = new LessonRepository();
      
      const deleted = await lessonRepository.delete(lessonId);
      if (!deleted) {
        res.status(404).json({ error: 'Lesson not found' });
        return;
      }

      res.json({ message: 'Lesson deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createSession(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, description, type, hostId, meetingUrl, scheduledAt, duration, maxParticipants, pointsRequired } = req.body;
      const sessionRepository = new SessionRepository();

      const session = new Session(
        `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
        title,
        description,
        type as SessionType,
        hostId || req.user!.userId,
        meetingUrl,
        new Date(scheduledAt),
        duration,
        maxParticipants,
        0,
        pointsRequired || 0,
        true,
        new Date(),
        new Date()
      );

      const saved = await sessionRepository.create(session);
      res.status(201).json(saved);
    } catch (error) {
      next(error);
    }
  }

  async updateSession(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const updates = req.body;
      
      const sessionRepository = new SessionRepository();
      const session = await sessionRepository.findById(sessionId);
      
      if (!session) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      Object.assign(session, updates);
      session.updatedAt = new Date();
      
      const updated = await sessionRepository.update(session);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }

  async deleteSession(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const sessionRepository = new SessionRepository();
      
      const deleted = await sessionRepository.delete(sessionId);
      if (!deleted) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      res.json({ message: 'Session deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getAnalyticsOverview(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Mock analytics data
      res.json({
        totalUsers: 1247,
        activeUsers: 892,
        monthlyRevenue: 623500,
        completionRate: 68
      });
    } catch (error) {
      next(error);
    }
  }

  async getRevenueAnalytics(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Mock revenue data
      res.json([
        { month: 'Jan', revenue: 450000 },
        { month: 'Feb', revenue: 480000 },
        { month: 'Mar', revenue: 520000 },
        { month: 'Apr', revenue: 580000 },
        { month: 'May', revenue: 610000 },
        { month: 'Jun', revenue: 623500 },
      ]);
    } catch (error) {
      next(error);
    }
  }

  async getEngagementAnalytics(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Mock engagement data
      res.json([
        { day: 'Mon', lessons: 245, posts: 89 },
        { day: 'Tue', lessons: 289, posts: 102 },
        { day: 'Wed', lessons: 312, posts: 95 },
        { day: 'Thu', lessons: 298, posts: 108 },
        { day: 'Fri', lessons: 276, posts: 92 },
        { day: 'Sat', lessons: 189, posts: 76 },
        { day: 'Sun', lessons: 167, posts: 65 },
      ]);
    } catch (error) {
      next(error);
    }
  }

  async createAnnouncement(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { content } = req.body;

      const createPostUseCase = new CreatePostUseCase(
        new PostRepository(),
        new UserRepository()
      );

      const post = await createPostUseCase.execute({
        userId: req.user!.userId,
        content,
        isAnnouncement: true
      });

      res.status(201).json(post);
    } catch (error) {
      next(error);
    }
  }

  // New method to get lesson with keywords
  async getLessonWithKeywords(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { lessonId } = req.params;
      const lessonRepository = new LessonRepository();
      const keywordRepository = new KeywordRepository();
      
      const lesson = await lessonRepository.findById(lessonId);
      if (!lesson) {
        res.status(404).json({ error: 'Lesson not found' });
        return;
      }

      let keywords: Keyword[] = [];
      if (lesson.lessonType === LessonType.KEYWORDS) {
        keywords = await keywordRepository.findByLessonId(lessonId);
      }

      res.json({ ...lesson, keywords });
    } catch (error) {
      next(error);
    }
  }
}