import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { CreatePostUseCase } from '../../../application/use-cases/community/CreatePostUseCase';
import { ToggleLikeUseCase } from '../../../application/use-cases/community/ToggleLikeUseCase';
import { PostRepository } from '../../database/repositories/PostRepository';
import { PostLikeRepository } from '../../database/repositories/PostLikeRepository';
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
      const result = await postRepository.findAll(Number(limit), offset, req.user!.userId);

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

  async toggleLike(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { postId } = req.params;

      const toggleLikeUseCase = new ToggleLikeUseCase(
        new PostRepository(),
        new PostLikeRepository()
      );

      const result = await toggleLikeUseCase.execute({
        userId: req.user!.userId,
        postId
      });

      res.json({
        message: result.isLiked ? 'Post liked' : 'Post dislike',
        isLiked: result.isLiked,
        likesCount: result.likesCount
      });
    } catch (error) {
      next(error);
    }
  }

  async deletePost(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { postId } = req.params;

      const postRepository = new PostRepository();
      const post = await postRepository.findById(postId);

      if (!post) {
        res.status(404).json({ error: "Post not found" });
        return;
      }

      // Fix: Use post.userId instead of post.author.userId
      if (post.author?.userId !== req.user?.userId && req.user?.role !== "ADMIN") {
        res.status(403).json({ error: "Not authorized to delete this post" });
        return;
      }

      const deleted = await postRepository.delete(postId);
      if (!deleted) {
        res.status(500).json({ error: 'Failed to delete post' });
        return;
      }

      res.json({ message: 'Post deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async editPost(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {


    try {
      const { postId } = req.params
      const { content, mediaUrls } = req.body

      const postRepository = new PostRepository()
      const post = await postRepository.findById(postId);

      if (!post) {
        res.status(404).json({ error: "Post not found" })
        return;
      }

      if (post.author.userId !== req.user?.userId && req.user?.role !== "ADMIN") {
        res.status(403).json({ error: "Not authorized to edit this post" })
        return;
      }

      post.content = content;
      post.mediaUrls = mediaUrls || post.mediaUrls;
      post.updatedAt = new Date()

      const updatedPost = await postRepository.update(post)

      if (!updatedPost) {
        res.status(500).json({ error: "Failed to edit post" })
        return;
      }

      res.json({message: "Post edited successfully"})

    } catch (error) {
      return next(error)
    }

  }
}