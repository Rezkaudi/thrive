import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { CreatePostUseCase } from '../../../application/use-cases/community/CreatePostUseCase';
import { PostRepository } from '../../database/repositories/PostRepository';
import { UserRepository } from '../../database/repositories/UserRepository';
import { ProfileRepository } from '../../database/repositories/ProfileRepository';

export class CommunityController {
  async createPost(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { content, mediaUrls, isAnnouncement } = req.body;

      const createPostUseCase = new CreatePostUseCase(
        new PostRepository(),
        new UserRepository(),
        new ProfileRepository()
      );

      const post = await createPostUseCase.execute({
        userId: req.user!.userId,
        content,
        mediaUrls,
        isAnnouncement
      });

      res.status(201).json(post);
    } catch (error) {
      next(error);
    }
  }

  async getPosts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20 } = req.query;
      const postRepository = new PostRepository();
      
      const offset = (Number(page) - 1) * Number(limit);
      const result = await postRepository.findAll(Number(limit), offset);

      res.json({
        posts: result.posts,
        total: result.total,
        page: Number(page),
        totalPages: Math.ceil(result.total / Number(limit))
      });
    } catch (error) {
      next(error);
    }
  }

  async likePost(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { postId } = req.params;
      const postRepository = new PostRepository();
      
      const post = await postRepository.incrementLikes(postId);
      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      res.json({ message: 'Post liked', likesCount: post.likesCount });
    } catch (error) {
      next(error);
    }
  }
}