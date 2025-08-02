import { Router } from 'express';
import { body } from 'express-validator';
import { CommunityController } from '../controllers/community.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();
const communityController = new CommunityController();

router.use(authenticate);

// Post routes
router.post(
  '/posts',
  [
    body('content').notEmpty().trim(),
    body('mediaUrls').optional().isArray(),
    body('isAnnouncement').optional().isBoolean()
  ],
  validateRequest,
  communityController.createPost
);

router.get('/posts', communityController.getPosts);

router.post('/posts/:postId/toggle-like', communityController.toggleLike);

router.put(
  '/posts/:postId',
  [
    body('content').notEmpty().trim(),
    body('mediaUrls').optional().isArray()
  ],
  validateRequest,
  communityController.editPost
);

router.delete('/posts/:postId', communityController.deletePost);

// Comment routes - All moved to community controller
router.get('/posts/:postId/comments', communityController.getCommentsByPost);

router.get('/posts/:postId/comments/count', communityController.getCommentCount);

router.post(
  '/posts/:postId/comments',
  [
    body('content')
      .notEmpty()
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Comment content must be between 1 and 1000 characters'),
    body('parentCommentId')
      .optional()
      .isString()
      .withMessage('Parent comment ID must be a string')
  ],
  validateRequest,
  communityController.createComment
);

router.get('/comments/:commentId', communityController.getCommentById);

router.put(
  '/comments/:commentId',
  [
    body('content')
      .notEmpty()
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Comment content must be between 1 and 1000 characters')
  ],
  validateRequest,
  communityController.updateComment
);

router.delete('/comments/:commentId', communityController.deleteComment);

router.get('/comments/:commentId/replies', communityController.getReplies);

export { router as communityRouter };