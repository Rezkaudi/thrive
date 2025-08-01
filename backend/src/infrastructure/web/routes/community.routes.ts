import { Router } from 'express';
import { body } from 'express-validator';
import { CommunityController } from '../controllers/community.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();
const communityController = new CommunityController();

router.use(authenticate);

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
)

router.delete('/posts/:postId', communityController.deletePost)
export { router as communityRouter };