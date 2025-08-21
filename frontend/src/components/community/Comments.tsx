// frontend/src/components/Comments.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Stack,
  IconButton,
  Divider,
  CircularProgress,
  Collapse,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Badge,
} from '@mui/material';
import {
  Reply,
  MoreVert,
  Edit,
  Delete,
  Send,
  Cancel,
  Save,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import {
  fetchComments,
  createComment,
  updateComment,
  deleteComment,
} from '../../store/slices/communitySlice';
import {
  fetchAnnouncementComments,
  createAnnouncementComment,
  updateAnnouncementComment,
  deleteAnnouncementComment,
} from '../../store/slices/announcementSlice';
import { linkifyText } from '../../utils/linkify';
// Import or define the Comment interface
interface Comment {
  id: string;
  userId: string;
  postId: string;
  content: string;
  parentCommentId?: string;
  author?: {
    userId: string;
    name: string;
    email: string;
    avatar: string;
    level: number;
  };
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
  isEditing?: boolean;
  isDeleting?: boolean;
  isReplying?: boolean;
  likesCount?: number;
  isLiked?: boolean;
}


// Format date utility
const formatCommentDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

interface CommentItemProps {
  comment: Comment;
  postId: string;
  currentUserId?: string;
  onReply: (parentId: string) => void;
  isReply?: boolean;
  isAnnouncement?: boolean; // New prop
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  postId,
  currentUserId,
  onReply,
  isReply = false,
  isAnnouncement = false // New prop with default
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const menuOpen = Boolean(anchorEl);
  const isOwnComment = currentUserId === comment.userId;

  useEffect(() => {
    if (!isEditing) {
      setEditContent(comment.content);
    }
  }, [comment.content, isEditing]);

  // Reset local loading states when comment state changes
  useEffect(() => {
    if (!comment.isEditing) {
      setIsUpdating(false);
    }
    if (!comment.isDeleting) {
      setIsDeleting(false);
    }
  }, [comment.isEditing, comment.isDeleting]);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(comment.content);
    handleMenuClose();
  };

  const handleSaveEdit = async () => {
    if (editContent.trim() && editContent !== comment.content) {
      setIsUpdating(true);
      try {
        if (isAnnouncement) {
          // Dispatch the new action for announcements
          await dispatch(updateAnnouncementComment({
            commentId: comment.id,
            data: { content: editContent.trim() }
          })).unwrap();
        } else {
          // Dispatch the existing action for posts
          await dispatch(updateComment({
            commentId: comment.id,
            data: { content: editContent.trim() }
          })).unwrap();
        }
        setIsEditing(false);
        setIsUpdating(false);
      } catch (error) {
        setEditContent(comment.content);
        setIsUpdating(false);
        console.error('Failed to save edit:', error);
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
    setIsUpdating(false);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      if (isAnnouncement) {
        await dispatch(deleteAnnouncementComment({
          commentId: comment.id,
          announcementId: postId,
        })).unwrap();
      } else {
        await dispatch(deleteComment({
          commentId: comment.id,
          postId
        })).unwrap();
      }
      setDeleteDialogOpen(false);
      setIsDeleting(false);
    } catch (error) {
      setIsDeleting(false);
      console.error('Failed to delete comment:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setIsDeleting(false);
  };

  const handleReplyClick = () => {
    onReply(comment.id);
  };

  // Determine the actual loading states
  const actuallyEditing = isUpdating || comment.isEditing;
  const actuallyDeleting = isDeleting || comment.isDeleting;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      layout
    >
      <Box
        sx={{
          ml: isReply ? 4 : 0,
          mt: 2,
          opacity: actuallyDeleting ? 0.5 : 1,
          position: 'relative',
        }}
      >
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Badge
            badgeContent={comment.author?.level ? `L${comment.author.level}` : undefined}
            color="primary"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Avatar
              src={comment.author?.avatar}
              sx={{ width: isReply ? 32 : 40, height: isReply ? 32 : 40 }}
            >
              {!comment.author?.avatar && comment.author?.name?.[0]}
            </Avatar>
          </Badge>

          <Box flexGrow={1}>
            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                sx={{ color: 'text.primary' }}
              >
                {comment.author?.name || 'Unknown User'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatCommentDate(comment.createdAt)}
              </Typography>
              {actuallyEditing && (
                <Typography variant="caption" color="info.main">
                  editing...
                </Typography>
              )}
            </Stack>

            {isEditing ? (
              <Box sx={{ mb: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  variant="outlined"
                  size="small"
                  disabled={actuallyEditing}
                  placeholder="Edit your comment..."
                  sx={{ mb: 1 }}
                />
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={actuallyEditing ? <CircularProgress size={14} /> : <Save />}
                    onClick={handleSaveEdit}
                    disabled={!editContent.trim() || actuallyEditing}
                  >
                    {actuallyEditing ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancelEdit}
                    disabled={actuallyEditing}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Typography
                variant="body2"
                sx={{ mb: 1, whiteSpace: 'pre-wrap' }}
              >
                {linkifyText(comment.content)}
              </Typography>
            )}

            {!isEditing && (
              <Stack direction="row" spacing={1} alignItems="center">
                {!isReply && (
                  <Button
                    size="small"
                    startIcon={<Reply />}
                    onClick={handleReplyClick}
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.75rem',
                      minWidth: 'auto',
                      px: 1,
                    }}
                    disabled={actuallyDeleting}
                  >
                    Reply
                  </Button>
                )}

                {comment.replies && comment.replies.length > 0 && !isReply && (
                  <Button
                    size="small"
                    startIcon={showReplies ? <ExpandLess /> : <ExpandMore />}
                    onClick={() => setShowReplies(!showReplies)}
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.75rem',
                      minWidth: 'auto',
                      px: 1,
                    }}
                  >
                    {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                  </Button>
                )}
              </Stack>
            )}
          </Box>

          <IconButton
            size="small"
            onClick={handleMenuClick}
            disabled={actuallyDeleting || isEditing}
            sx={{ color: 'text.secondary' }}
          >
            <MoreVert fontSize="small" />
          </IconButton>

          {/* Options Menu */}
          <Menu
            anchorEl={anchorEl}
            open={menuOpen && !isEditing}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            {isOwnComment && (
              <MenuItem
                onClick={handleEdit}
                disabled={actuallyEditing || isEditing || actuallyDeleting}
              >
                <ListItemIcon>
                  <Edit fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit</ListItemText>
              </MenuItem>
            )}

            {isOwnComment && (
              <MenuItem
                onClick={handleDeleteClick}
                sx={{ color: 'error.main' }}
                disabled={actuallyDeleting || isEditing}
              >
                <ListItemIcon>
                  <Delete fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Delete</ListItemText>
              </MenuItem>
            )}
          </Menu>
        </Stack>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && !isReply && (
          <Collapse in={showReplies}>
            <Box sx={{ mt: 1 }}>
              <AnimatePresence>
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    postId={postId}
                    currentUserId={currentUserId}
                    onReply={onReply}
                    isReply={true}
                    isAnnouncement={isAnnouncement} // Pass through the prop
                  />
                ))}
              </AnimatePresence>
            </Box>
          </Collapse>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
        >
          <DialogTitle>Delete Comment</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this comment? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} disabled={actuallyDeleting}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
              disabled={actuallyDeleting}
              startIcon={actuallyDeleting ? <CircularProgress size={16} /> : undefined}
            >
              {actuallyDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </motion.div>
  );
};

interface CommentsProps {
  postId: string;
  commentsCount?: number;
  isOpen: boolean;
  onToggle: () => void;
  isAnnouncement?: boolean; // New prop to distinguish between posts and announcements
}

export const Comments: React.FC<CommentsProps> = ({
  postId,
  commentsCount = 0,
  isOpen,
  onToggle,
  isAnnouncement = false, // New prop with default
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  // Get the appropriate item and state based on type - moved outside function and using hooks properly
  const announcements = useSelector((state: RootState) => state.announcements?.announcements || []);
  const posts = useSelector((state: RootState) => state.community.posts);
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
  const profilePhoto = useSelector((state: RootState) => state.dashboard.data?.user.profilePhoto);
  const name = useSelector((state: RootState) => state.dashboard.data?.user.name);

  // Get item data based on type
  const item = isAnnouncement 
    ? announcements.find((a: any) => a.id === postId)
    : posts.find(p => p.id === postId);

  const comments = (item as any)?.comments || [];
  const commentsLoading = (item as any)?.commentsLoading || false;
  const commentsHasMore = (item as any)?.commentsHasMore || false;
  const commentsInitialized = (item as any)?.commentsInitialized || false;
  const commentsPage = (item as any)?.commentsPage || 1;

  // Debug logging
  useEffect(() => {
    console.log('Comments Debug:', {
      postId,
      isOpen,
      commentsCount,
      commentsLength: comments.length,
      commentsLoading,
      commentsInitialized,
      hasAttemptedFetch,
      item: !!item,
      isAnnouncement
    });
  }, [postId, isOpen, commentsCount, comments.length, commentsLoading, commentsInitialized, hasAttemptedFetch, item, isAnnouncement]);

  // Fetch comments when section is opened
  useEffect(() => {
    if (isOpen && !hasAttemptedFetch && !commentsLoading) {
      console.log(`Attempting to fetch comments for ${isAnnouncement ? 'announcement' : 'post'}:`, postId);
      setHasAttemptedFetch(true);
      
      if (isAnnouncement) {
        dispatch(fetchAnnouncementComments({
          announcementId: postId,
          page: 1,
          limit: 20,
          includeReplies: true,
        }));
      } else {
        dispatch(fetchComments({ postId, page: 1, limit: 20 }));
      }
    }
  }, [isOpen, hasAttemptedFetch, commentsLoading, dispatch, postId, isAnnouncement]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      if (isAnnouncement) {
        await dispatch(createAnnouncementComment({
          announcementId: postId,
          data: {
            content: newComment.trim(),
            parentCommentId: replyTo || undefined
          }
        })).unwrap();
      } else {
        await dispatch(createComment({
          postId,
          data: {
            content: newComment.trim(),
            parentCommentId: replyTo || undefined
          }
        })).unwrap();
      }
      
      setNewComment('');
      setReplyTo(null);
      
      // Ensure we've attempted fetch after creating a comment
      if (!hasAttemptedFetch) {
        setHasAttemptedFetch(true);
      }
    } catch (error) {
      console.error('Failed to create comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = (parentId: string) => {
    setReplyTo(parentId);
  };

  const handleLoadMore = () => {
    if (item && !commentsLoading && commentsHasMore) {
      if (isAnnouncement) {
        dispatch(fetchAnnouncementComments({
          announcementId: postId,
          page: commentsPage + 1,
          limit: 20,
          includeReplies: true,
        }));
      } else {
        dispatch(fetchComments({
          postId,
          page: commentsPage + 1,
          limit: 20
        }));
      }
    }
  };

  // Determine what to show
  const shouldShowLoading = commentsLoading && comments.length === 0;
  const shouldShowComments = comments.length > 0;
  const shouldShowEmpty = hasAttemptedFetch && !commentsLoading && comments.length === 0;

  return (
    <Box>
      <Collapse in={isOpen}>
        <Box sx={{ p: 2 }}>
          {/* New Comment Form */}
          <Stack direction="row" spacing={2} mb={3}>
            <Avatar src={profilePhoto} sx={{ width: 40, height: 40 }}>
              {!profilePhoto ? name?.[0] : "U"}
            </Avatar>
            <Box flexGrow={1}>
              {replyTo && (
                <Typography variant="caption" color="info.main" sx={{ mb: 1, display: 'block' }}>
                  Replying to comment...
                  <Button
                    size="small"
                    onClick={() => setReplyTo(null)}
                    sx={{ ml: 1, minWidth: 'auto', p: 0 }}
                  >
                    <Cancel fontSize="small" />
                  </Button>
                </Typography>
              )}
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder={replyTo ? "Write a reply..." : `Write a comment on this ${isAnnouncement ? 'announcement' : 'post'}...`}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                variant="outlined"
                size="small"
                disabled={isSubmitting}
                sx={{ mb: 1 }}
              />
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={isSubmitting ? <CircularProgress size={14} /> : <Send />}
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                >
                  {isSubmitting ? 'Posting...' : 'Post'}
                </Button>
                {replyTo && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setReplyTo(null)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                )}
              </Stack>
            </Box>
          </Stack>
          
          <Divider sx={{ mb: 2 }} />
          
          {/* Comments List */}
          {shouldShowLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ ml: 2 }}>
                Loading comments...
              </Typography>
            </Box>
          ) : shouldShowComments ? (
            <Box>
              <AnimatePresence>
                {comments.map((comment: any) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    postId={postId}
                    currentUserId={currentUserId}
                    onReply={handleReply}
                    isAnnouncement={isAnnouncement} // Pass the prop
                  />
                ))}
              </AnimatePresence>
              
              {commentsHasMore && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={handleLoadMore}
                    disabled={commentsLoading}
                    startIcon={commentsLoading ? <CircularProgress size={16} /> : undefined}
                  >
                    {commentsLoading ? 'Loading...' : 'Load More Comments'}
                  </Button>
                </Box>
              )}
            </Box>
          ) : shouldShowEmpty ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body2" color="text.secondary">
                No comments yet. Be the first to comment on this {isAnnouncement ? 'announcement' : 'post'}!
              </Typography>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {hasAttemptedFetch ? 'No comments to show' : 'Open to view comments'}
              </Typography>
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};