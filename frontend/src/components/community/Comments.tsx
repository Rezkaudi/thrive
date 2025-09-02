// frontend/src/components/community/Comments.tsx - Fixed comment editing
import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Card,
  Collapse,
  Typography,
  TextField,
  Button,
  Avatar,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Divider,
  Badge,
  Alert,
  Fade,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Send,
  MoreVert,
  Edit,
  Delete,
  Report,
  Save,
  Cancel,
  Reply,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { AppDispatch, RootState } from '../../store/store';
import {
  fetchComments,
  createComment,
  updateComment,
  deleteComment,
  startEditComment,
  startDeleteComment,
} from '../../store/slices/communitySlice';
import {
  fetchAnnouncementComments,
  createAnnouncementComment,
  updateAnnouncementComment,
  deleteAnnouncementComment,
  startEditAnnouncementComment,
  startDeleteAnnouncementComment,
} from '../../store/slices/announcementSlice';
import {
  fetchFeedbackComments,
  createFeedbackComment,
  updateFeedbackComment,
  deleteFeedbackComment,
  startDeleteFeedbackComment,
  startEditFeedbackComment,
} from '../../store/slices/feedbackSlice';
import { linkifyText } from '../../utils/linkify';

interface Comment {
  id: string;
  userId: string;
  postId: string;
  content: string;
  parentCommentId?: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    userId: string;
    name: string;
    email: string;
    avatar: string;
    level?: number;
  };
  replies?: Comment[];
  isEditing?: boolean;
  isDeleting?: boolean;
}

interface CommentsProps {
  postId: string;
  commentsCount?: number;
  isOpen: boolean;
  onToggle: () => void;
  isAnnouncement?: boolean;
  isFeedback?: boolean;
}

const formatCommentDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return diffMinutes <= 1 ? 'Just now' : `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
};

interface CommentItemProps {
  comment: Comment;
  onReply: (parentId: string) => void;
  onEdit: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  onReport: (commentId: string, reason: string) => void;
  currentUserId?: string;
  level?: number;
  isAnnouncement?: boolean;
  isFeedback?: boolean;
  postId: string; // Add postId prop
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onReply,
  onEdit,
  onDelete,
  onReport,
  currentUserId,
  level = 0,
  isAnnouncement,
  isFeedback,
  postId, // Add postId parameter
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showReplies, setShowReplies] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isOwner = currentUserId === comment.userId;
  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditContent(comment.content);
    handleMenuClose();
    // REMOVED: onEdit(comment.id) - this was causing the TextField to be disabled
    // The onEdit should only be called during save operation via Redux pending states
  };

  const handleSaveEdit = async () => {
    if (editContent.trim() && editContent !== comment.content) {
      try {
        if (isAnnouncement) {
          await dispatch(updateAnnouncementComment({
            commentId: comment.id,
            announcementId: postId, // Add missing announcementId
            data: { content: editContent.trim() }
          })).unwrap();
        } else if (isFeedback) {
          await dispatch(updateFeedbackComment({
            commentId: comment.id,
            data: { content: editContent.trim() }
          })).unwrap();
        } else {
          await dispatch(updateComment({
            commentId: comment.id,
            data: { content: editContent.trim() }
          })).unwrap();
        }
        setIsEditing(false);
      } catch (error) {
        console.error('Failed to update comment:', error);
        setEditContent(comment.content);
      }
    } else {
      setIsEditing(false);
      setEditContent(comment.content);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    onDelete(comment.id);
  };

  const handleReportClick = () => {
    setReportDialogOpen(true);
    setReportReason('');
    handleMenuClose();
  };

  const handleReportSubmit = () => {
    if (reportReason.trim()) {
      onReport(comment.id, reportReason);
      setReportDialogOpen(false);
      setReportReason('');
    }
  };

  return (
    <Box
      sx={{
        ml: level * (isMobile ? 2 : 4),
        mb: 2,
        opacity: comment.isDeleting ? 0.5 : 1,
        transition: 'opacity 0.3s ease',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          variant="outlined"
          sx={{
            p: 2,
            bgcolor: level > 0 ? 'grey.50' : 'background.paper',
            position: 'relative',
          }}
        >
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Badge
              badgeContent={
                comment.author?.level ? `L${comment.author.level}` : undefined
              }
              color="primary"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              sx={{ flexShrink: 0 }}
            >
              <Avatar
                src={comment.author?.avatar}
                sx={{ width: 32, height: 32 }}
              >
                {comment.author?.name?.[0] || 'U'}
              </Avatar>
            </Badge>

            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                mb={1}
              >
                <Box>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    sx={{ color: 'text.primary' }}
                  >
                    {comment.author?.name || 'Unknown User'}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: '0.75rem' }}
                  >
                    {formatCommentDate(comment.createdAt)}
                    {comment.createdAt !== comment.updatedAt && ' (edited)'}
                  </Typography>
                </Box>

                <IconButton
                  size="small"
                  onClick={handleMenuClick}
                  disabled={comment.isDeleting}
                  sx={{
                    opacity: 0.7,
                    '&:hover': { opacity: 1 },
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  <MoreVert fontSize="small" />
                </IconButton>
              </Stack>

              {/* Comment Content */}
              {isEditing ? (
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={isMobile ? 2 : 3}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    variant="outlined"
                    size="small"
                    disabled={comment.isEditing} // Only disabled during actual save operation
                    sx={{ mb: 1 }}
                  />
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={handleSaveEdit}
                      disabled={
                        !editContent.trim() ||
                        editContent === comment.content ||
                        comment.isEditing // Only disabled during actual save operation
                      }
                      startIcon={
                        comment.isEditing ? (
                          <CircularProgress size={14} />
                        ) : (
                          <Save />
                        )
                      }
                    >
                      {comment.isEditing ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleCancelEdit}
                      disabled={comment.isEditing}
                      startIcon={<Cancel />}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </Box>
              ) : (
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {linkifyText(comment.content)}
                </Typography>
              )}

              {/* Actions */}
              {!isEditing && !comment.isEditing && level < 3 && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => onReply(comment.id)}
                    startIcon={<Reply fontSize="small" />}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': { color: 'primary.main' },
                      textTransform: 'none',
                      fontSize: '0.75rem',
                    }}
                  >
                    Reply
                  </Button>
                </Stack>
              )}
            </Box>
          </Stack>

          {/* Loading overlay for deleting */}
          {comment.isDeleting && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1,
              }}
            >
              <CircularProgress size={24} />
            </Box>
          )}
        </Card>

        {/* Options Menu */}
        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
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
          {isOwner && (
            <MenuItem
              onClick={handleEditClick}
              disabled={comment.isEditing || comment.isDeleting}
            >
              <ListItemIcon>
                <Edit fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
          )}

          {isOwner && (
            <MenuItem
              onClick={handleDeleteClick}
              disabled={comment.isDeleting}
              sx={{ color: 'error.main' }}
            >
              <ListItemIcon>
                <Delete fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          )}

          {!isOwner && (
            <MenuItem onClick={handleReportClick} sx={{ color: 'warning.main' }}>
              <ListItemIcon>
                <Report fontSize="small" color="warning" />
              </ListItemIcon>
              <ListItemText>Report</ListItemText>
            </MenuItem>
          )}
        </Menu>

        {/* Report Dialog */}
        <Dialog
          open={reportDialogOpen}
          onClose={() => setReportDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Report Comment</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Please provide a reason for reporting this comment:
            </DialogContentText>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Describe why you're reporting this comment..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReportDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleReportSubmit}
              color="warning"
              variant="contained"
              disabled={!reportReason.trim()}
            >
              Report
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Button
            size="small"
            variant="text"
            onClick={() => setShowReplies(!showReplies)}
            endIcon={showReplies ? <ExpandLess /> : <ExpandMore />}
            sx={{
              color: 'text.secondary',
              textTransform: 'none',
              fontSize: '0.75rem',
              ml: level * (isMobile ? 2 : 4) + 6,
            }}
          >
            {showReplies ? 'Hide' : 'Show'} {comment.replies.length}{' '}
            {comment.replies.length === 1 ? 'reply' : 'replies'}
          </Button>
          <Collapse in={showReplies}>
            <AnimatePresence>
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onReport={onReport}
                  currentUserId={currentUserId}
                  level={level + 1}
                  isAnnouncement={isAnnouncement}
                  isFeedback={isFeedback}
                  postId={postId} // Pass postId to recursive calls
                />
              ))}
            </AnimatePresence>
          </Collapse>
        </Box>
      )}
    </Box>
  );
};

export const Comments: React.FC<CommentsProps> = ({
  postId,
  commentsCount,
  isOpen,
  onToggle,
  isAnnouncement,
  isFeedback,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // FIX: Call useSelector hooks directly at the top level of the component
  const announcement = useSelector((state: RootState) =>
    state.announcements.announcements.find((a) => a.id === postId)
  );
  const feedbackItem = useSelector((state: RootState) =>
    state.feedback.feedback.find((f) => f.id === postId)
  );
  const post = useSelector((state: RootState) =>
    state.community.posts.find((p) => p.id === postId)
  );

  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
  const userProfile = useSelector(
    (state: RootState) => state.dashboard.data?.user
  );

  // Use useMemo to select the correct state based on props
  const { comments, commentsLoading, commentsInitialized } = useMemo(() => {
    if (isAnnouncement) {
      return {
        comments: (announcement as any)?.comments || [],
        commentsLoading: (announcement as any)?.commentsLoading || false,
        commentsInitialized: (announcement as any)?.commentsInitialized || false,
      };
    } else if (isFeedback) {
      return {
        comments: feedbackItem?.comments || [],
        commentsLoading: feedbackItem?.commentsLoading || false,
        commentsInitialized: feedbackItem?.commentsInitialized || false,
      };
    } else {
      return {
        comments: (post as any)?.comments || [],
        commentsLoading: (post as any)?.commentsLoading || false,
        commentsInitialized: (post as any)?.commentsInitialized || false,
      };
    }
  }, [isAnnouncement, isFeedback, announcement, feedbackItem, post]);

  useEffect(() => {
    if (isOpen && !commentsInitialized && !commentsLoading) {
      if (isAnnouncement) {
        dispatch(fetchAnnouncementComments({ announcementId: postId, page: 1, limit: 50 }));
      } else if (isFeedback) {
        dispatch(fetchFeedbackComments({ feedbackId: postId, page: 1, limit: 50 }));
      } else {
        dispatch(fetchComments({ postId, page: 1, limit: 50 }));
      }
    }
  }, [
    isOpen,
    commentsInitialized,
    commentsLoading,
    postId,
    dispatch,
    isAnnouncement,
    isFeedback,
  ]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      if (isAnnouncement) {
        await dispatch(
          createAnnouncementComment({
            announcementId: postId,
            data: {
              content: newComment.trim(),
              parentCommentId: replyToCommentId || undefined,
            },
          })
        ).unwrap();
      } else if (isFeedback) {
        await dispatch(
          createFeedbackComment({
            feedbackId: postId,
            data: {
              content: newComment.trim(),
              parentCommentId: replyToCommentId || undefined,
            },
          })
        ).unwrap();
      } else {
        await dispatch(
          createComment({
            postId,
            data: {
              content: newComment.trim(),
              parentCommentId: replyToCommentId || undefined,
            },
          })
        ).unwrap();
      }

      setNewComment('');
      setReplyToCommentId(null);
    } catch (error) {
      console.error('Failed to create comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = (commentId: string) => {
    // This function is no longer needed for starting edit mode
    // It was causing the issue by dispatching actions too early
    // The Redux actions for editing are now only called during save operation
    console.log('Edit comment:', commentId);
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      if (isAnnouncement) {
        dispatch(startDeleteAnnouncementComment({ announcementId: postId, commentId }));
        await dispatch(
          deleteAnnouncementComment({ commentId, announcementId: postId })
        ).unwrap();
      } else if (isFeedback) {
        dispatch(startDeleteFeedbackComment({ feedbackId: postId, commentId }));
        await dispatch(
          deleteFeedbackComment({ commentId, feedbackId: postId })
        ).unwrap();
      } else {
        dispatch(startDeleteComment({ postId, commentId }));
        await dispatch(deleteComment({ commentId, postId })).unwrap();
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleReportComment = (commentId: string, reason: string) => {
    console.log('Report comment:', commentId, reason);
    // Implement reporting logic here
  };

  const handleReply = (parentCommentId: string) => {
    setReplyToCommentId(parentCommentId);
    const commentInput = document.getElementById('comment-input');
    if (commentInput) {
      commentInput.focus();
    }
  };

  const cancelReply = () => {
    setReplyToCommentId(null);
  };

  return (
    <Collapse in={isOpen} timeout={300}>
      <Divider />
      <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6" fontWeight={600}>
            Comments {commentsCount !== undefined && `(${commentsCount})`}
          </Typography>
          <Button
            size="small"
            onClick={onToggle}
            startIcon={<ExpandLess />}
            sx={{ color: 'text.secondary' }}
          >
            Hide
          </Button>
        </Stack>

        <Box sx={{ mb: 3 }}>
          {replyToCommentId && (
            <Alert
              severity="info"
              sx={{ mb: 2 }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={cancelReply}
                  startIcon={<Cancel />}
                >
                  Cancel Reply
                </Button>
              }
            >
              Replying to comment
            </Alert>
          )}

          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Avatar
              src={userProfile?.profilePhoto}
              sx={{ width: 40, height: 40, mt: 0.5 }}
            >
              {userProfile?.name?.[0] || 'U'}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <TextField
                id="comment-input"
                fullWidth
                multiline
                rows={isMobile ? 2 : 3}
                placeholder={
                  replyToCommentId
                    ? 'Write a reply...'
                    : `Add a comment to this ${isAnnouncement ? 'announcement' : isFeedback ? 'feedback' : 'post'}...`
                }
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                variant="outlined"
                disabled={isSubmitting}
                sx={{
                  mb: 1,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'background.paper',
                  },
                }}
              />
              <Stack direction="row" justifyContent="flex-end">
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <Send />
                    )
                  }
                  sx={{ borderRadius: 2 }}
                >
                  {isSubmitting
                    ? 'Posting...'
                    : replyToCommentId
                      ? 'Reply'
                      : 'Comment'}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Box>

        {commentsLoading && comments.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : comments.length > 0 ? (
          <AnimatePresence>
            {comments.map((comment: Comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={handleReply}
                onEdit={handleEditComment}
                onDelete={handleDeleteComment}
                onReport={handleReportComment}
                currentUserId={currentUserId}
                isAnnouncement={isAnnouncement}
                isFeedback={isFeedback}
                postId={postId} // Pass postId to CommentItem
              />
            ))}
          </AnimatePresence>
        ) : commentsInitialized ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No comments yet. Be the first to comment!
            </Typography>
          </Box>
        ) : null}
      </Box>
    </Collapse>
  );
};