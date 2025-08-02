import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Card,
  CardContent,
  CardActions,
  Typography,
  TextField,
  Button,
  Avatar,
  Stack,
  IconButton,
  Chip,
  Paper,
  Tabs,
  Tab,
  Divider,
  Badge,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Backdrop,
} from "@mui/material";
import {
  ThumbUp,
  Comment,
  Share,
  PhotoCamera,
  VideoCall,
  Campaign,
  TrendingUp,
  MoreVert,
  Edit,
  Delete,
  Report,
  Save,
  Cancel,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Comments } from "../components/community/Comments";
import { AppDispatch, RootState } from "../store/store";
import {
  createPost,
  deletePost,
  editPost,
  fetchCommentCount,
  fetchPosts,
  toggleCommentsSection,
  toggleLike,
} from "../store/slices/communitySlice";
import { clearError } from "../store/slices/authSlice";

interface ComponentPost {
  id: string;
  author?: {
    userId: string;
    name: string;
    email: string;
    avatar: string;
    level?: number;
  };
  content: string;
  mediaUrls: string[];
  isAnnouncement: boolean;
  likesCount: number;
  createdAt: string;
  isLiked: boolean;
  isEditing?: boolean;
  isDeleting?: boolean;
  commentsCount?: number;
  comments?: any[];
  commentsLoading?: boolean;
  commentsInitialized?: boolean;
}

// Format date utility
const formatPostDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Format Time utility
const formatPostTime = (timeString: string): string => {
  const time = new Date(timeString);
  return time.toLocaleTimeString("en-US", {
    minute: "2-digit",
    hour: "2-digit",
  });
};

interface PostCardProps {
  post: ComponentPost;
  onToggleLike: (postId: string) => void;
  onEdit: (postId: string, newContent: string, mediaUrls?: string[]) => void;
  onDelete: (postId: string) => void;
  onReport: (postId: string, reason: string) => void;
  currentUserId?: string;
}

const PostCard = ({
  post,
  onToggleLike,
  onEdit,
  onDelete,
  onReport,
  currentUserId,
}: PostCardProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editMediaUrls, setEditMediaUrls] = useState<string[]>(post.mediaUrls);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [commentsOpen, setCommentsOpen] = useState(false);

  const menuOpen = Boolean(anchorEl);
  const isOwnPost = currentUserId === post.author?.userId;

  // Only fetch comment count if we don't have it and haven't initialized comments
  useEffect(() => {
    if (post.commentsCount === undefined && !post.commentsInitialized) {
      // Add a small delay to prevent too many simultaneous requests
      const timer = setTimeout(() => {
        dispatch(fetchCommentCount(post.id));
      }, Math.random() * 1000); // Random delay between 0-1 seconds

      return () => clearTimeout(timer);
    }
  }, [dispatch, post.id, post.commentsCount, post.commentsInitialized]);

  useEffect(() => {
    if (!isEditing) {
      setEditContent(post.content);
      setEditMediaUrls(post.mediaUrls);
    }
  }, [post.content, post.mediaUrls, isEditing]);

  useEffect(() => {
    if (!post.isEditing && !isEditing) {
      setEditContent(post.content);
      setEditMediaUrls(post.mediaUrls);
    }
  }, [post.isEditing, post.content, post.mediaUrls, isEditing]);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(post.content);
    setEditMediaUrls(post.mediaUrls);
    handleMenuClose();
  };

  const handleSaveEdit = async () => {
    if (
      editContent.trim() &&
      (editContent !== post.content ||
        JSON.stringify(editMediaUrls) !== JSON.stringify(post.mediaUrls))
    ) {
      try {
        await onEdit(post.id, editContent, editMediaUrls);
        setIsEditing(false);
      } catch (error) {
        setEditContent(post.content);
        setEditMediaUrls(post.mediaUrls);
        console.error("Failed to save edit:", error);
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(post.content);
    setEditMediaUrls(post.mediaUrls);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    try {
      await onDelete(post.id);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  const handleReportClick = () => {
    setReportDialogOpen(true);
    setReportReason("");
    handleMenuClose();
  };

  const handleReportSubmit = () => {
    if (reportReason.trim()) {
      onReport(post.id, reportReason);
      setReportDialogOpen(false);
      setReportReason("");
    }
  };

  const handleRemoveMediaUrl = (index: number) => {
    const newUrls = editMediaUrls.filter((_, i) => i !== index);
    setEditMediaUrls(newUrls);
  };

  const handleMediaUrlChange = (index: number, value: string) => {
    const newUrls = [...editMediaUrls];
    newUrls[index] = value;
    setEditMediaUrls(newUrls);
  };

  const handleAddMediaUrl = () => {
    setEditMediaUrls([...editMediaUrls, ""]);
  };

  const handleCommentsToggle = () => {
    if (!commentsOpen) {
      dispatch(toggleCommentsSection(post.id));
    }
    setCommentsOpen(!commentsOpen);
  };

  // Don't show comment count if it's 0 and we haven't initialized
  const displayCommentsCount =
    post.commentsCount !== undefined
      ? post.commentsCount
      : post.commentsInitialized
      ? 0
      : "...";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
    >
      <Card
        sx={{
          mb: 3,
          position: "relative",
          opacity: post.isDeleting ? 0.5 : 1,
          ...(post.isAnnouncement && {
            border: "2px solid",
            borderColor: "primary.main",
          }),
        }}
      >
        {/* Loading overlay for deleting */}
        {post.isDeleting && (
          <Backdrop
            sx={{
              position: "absolute",
              zIndex: 1,
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              borderRadius: 1,
            }}
            open={true}
          >
            <CircularProgress />
          </Backdrop>
        )}

        <CardContent>
          <Stack direction="row" spacing={2} alignItems="flex-start" mb={2}>
            <Badge
              badgeContent={
                post.author?.level ? `L${post.author.level}` : undefined
              }
              color="primary"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
              <Avatar src={post.author?.avatar} sx={{ width: 48, height: 48 }}>
                {!post.author?.avatar && post.author?.name?.[0]}
              </Avatar>
            </Badge>
            <Box flexGrow={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Link
                  to={`/profile/${post.author?.userId}`}
                  target="_blank"
                  style={{ textDecoration: "none" }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{
                      color: "#2D3436",
                      "&:hover": {
                        color: "primary.main",
                      },
                      transition: "color 0.2s ease-in-out",
                    }}
                  >
                    {post.author?.name || "Unknown User"}
                  </Typography>
                </Link>
                {post.isAnnouncement && (
                  <Chip
                    icon={<Campaign />}
                    label="Announcement"
                    size="small"
                    color="primary"
                  />
                )}
                {(post.isEditing || isEditing) && (
                  <Chip
                    label="Editing..."
                    size="small"
                    color="info"
                    variant="outlined"
                  />
                )}
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {post.author?.email} • {formatPostDate(post.createdAt)}{" "}
                {formatPostTime(post.createdAt)}
              </Typography>
            </Box>

            <IconButton
              size="small"
              onClick={handleMenuClick}
              disabled={post.isDeleting}
              sx={{
                color: "text.secondary",
                "&:hover": {
                  color: "text.primary",
                  bgcolor: "action.hover",
                },
              }}
            >
              <MoreVert />
            </IconButton>

            {/* Options Menu */}
            <Menu
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              {isOwnPost && (
                <MenuItem
                  onClick={handleEdit}
                  disabled={post.isEditing || isEditing}
                >
                  <ListItemIcon>
                    <Edit fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Edit</ListItemText>
                </MenuItem>
              )}

              {isOwnPost && (
                <MenuItem
                  onClick={handleDeleteClick}
                  sx={{ color: "error.main" }}
                  disabled={post.isDeleting}
                >
                  <ListItemIcon>
                    <Delete fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText>Delete</ListItemText>
                </MenuItem>
              )}

              {!isOwnPost && (
                <MenuItem
                  onClick={handleReportClick}
                  sx={{ color: "warning.main" }}
                >
                  <ListItemIcon>
                    <Report fontSize="small" color="warning" />
                  </ListItemIcon>
                  <ListItemText>Report</ListItemText>
                </MenuItem>
              )}
            </Menu>
          </Stack>

          {/* Post Content - Editable or Display */}
          {isEditing ? (
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                variant="outlined"
                sx={{ mb: 2 }}
                disabled={post.isEditing}
                placeholder="Edit your post content..."
              />

              {/* Media URLs editing */}
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  gutterBottom
                  display="block"
                >
                  Media URLs:
                </Typography>
                {editMediaUrls.map((url, index) => (
                  <TextField
                    key={index}
                    fullWidth
                    size="small"
                    value={url}
                    onChange={(e) =>
                      handleMediaUrlChange(index, e.target.value)
                    }
                    sx={{ mb: 1 }}
                    disabled={post.isEditing}
                    placeholder={`Media URL ${index + 1}`}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveMediaUrl(index)}
                          disabled={post.isEditing}
                          sx={{ color: "error.main" }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      ),
                    }}
                  />
                ))}
                <Button
                  size="small"
                  onClick={handleAddMediaUrl}
                  disabled={post.isEditing}
                  sx={{ mt: 1 }}
                >
                  Add Media URL
                </Button>
              </Box>

              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={
                    post.isEditing ? <CircularProgress size={16} /> : <Save />
                  }
                  onClick={handleSaveEdit}
                  disabled={!editContent.trim() || post.isEditing}
                >
                  {post.isEditing ? "Saving..." : "Save"}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={handleCancelEdit}
                  disabled={post.isEditing}
                >
                  Cancel
                </Button>
              </Stack>
            </Box>
          ) : (
            <Typography variant="body1" sx={{ mb: 2, whiteSpace: "pre-wrap" }}>
              {post.content}
            </Typography>
          )}

          {post.mediaUrls.length > 0 && !isEditing && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns:
                  post.mediaUrls.length === 1 ? "1fr" : "repeat(2, 1fr)",
                gap: 1,
                mb: 2,
              }}
            >
              {post.mediaUrls.map((url, index) => (
                <Paper
                  key={index}
                  sx={{
                    paddingTop: "56.25%",
                    position: "relative",
                    bgcolor: "grey.100",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Media {index + 1}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </CardContent>

        <Divider />

        <CardActions sx={{ px: 2 }}>
          <Stack direction="row" spacing={2} flexGrow={1}>
            <Button
              startIcon={<ThumbUp />}
              size="small"
              color={post.isLiked ? "primary" : "inherit"}
              sx={{ textTransform: "none" }}
              onClick={() => onToggleLike(post.id)}
              disabled={post.isDeleting}
            >
              {post.likesCount} {post.likesCount === 1 ? "Like" : "Likes"}
            </Button>
            <Button
              startIcon={<Comment />}
              size="small"
              sx={{ textTransform: "none" }}
              onClick={handleCommentsToggle}
              disabled={post.isDeleting}
              color={commentsOpen ? "primary" : "inherit"}
            >
              {displayCommentsCount}{" "}
              {displayCommentsCount === 1 ? "Comment" : "Comments"}
            </Button>
            <Button
              startIcon={<Share />}
              size="small"
              sx={{ textTransform: "none" }}
              disabled={post.isDeleting}
            >
              Share
            </Button>
          </Stack>
        </CardActions>

        {/* Comments Section */}
        <Comments
          postId={post.id}
          commentsCount={post.commentsCount}
          isOpen={commentsOpen}
          onToggle={handleCommentsToggle}
        />
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Post</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this post? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={post.isDeleting}
            startIcon={
              post.isDeleting ? <CircularProgress size={16} /> : undefined
            }
          >
            {post.isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report Dialog */}
      <Dialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Report Post</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please provide a reason for reporting this post:
          </DialogContentText>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Describe why you're reporting this post..."
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
  );
};

export const CommunityPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [newPost, setNewPost] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  const dispatch = useDispatch<AppDispatch>();
  const {
    posts,
    loading,
    error,
    editError,
    deleteError,
    commentError,
    currentPage,
    totalPosts,
  } = useSelector((state: RootState) => state.community);

  const profilePhoto = useSelector(
    (state: RootState) => state.dashboard.data?.user.profilePhoto
  );
  const name = useSelector(
    (state: RootState) => state.dashboard.data?.user.name
  );
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);

  // Fetch posts when component mounts
  useEffect(() => {
    dispatch(fetchPosts({ page: 1, limit: 20 }));
  }, [dispatch]);

  // Handle errors with snackbar
  useEffect(() => {
    if (editError) {
      setSnackbar({ open: true, message: editError, severity: "error" });
      dispatch(clearError());
    }
  }, [editError, dispatch]);

  useEffect(() => {
    if (deleteError) {
      setSnackbar({ open: true, message: deleteError, severity: "error" });
      dispatch(clearError());
    }
  }, [deleteError, dispatch]);

  useEffect(() => {
    if (commentError) {
      setSnackbar({ open: true, message: commentError, severity: "error" });
      dispatch(clearError());
    }
  }, [commentError, dispatch]);

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    setIsSubmitting(true);
    try {
      await dispatch(createPost({ content: newPost })).unwrap();
      setNewPost("");
      setSnackbar({
        open: true,
        message: "Post created successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to create post:", error);
      setSnackbar({
        open: true,
        message: "Failed to create post",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLike = (postId: string) => {
    dispatch(toggleLike(postId));
  };

  const handleEditPost = async (
    postId: string,
    newContent: string,
    mediaUrls?: string[]
  ) => {
    try {
      await dispatch(
        editPost({ postId, content: newContent, mediaUrls })
      ).unwrap();
      setSnackbar({
        open: true,
        message: "Post updated successfully!",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error || "Failed to edit post",
        severity: "error",
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await dispatch(deletePost(postId)).unwrap();
      setSnackbar({
        open: true,
        message: "Post deleted successfully!",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error || "Failed to delete post",
        severity: "error",
      });
    }
  };

  const handleReportPost = async (postId: string, reason: string) => {
    try {
      // await dispatch(reportPost({ postId, reason })).unwrap();
      setSnackbar({
        open: true,
        message: "Post reported successfully!",
        severity: "info",
      });
    } catch (error) {
      console.error("Failed to report post:", error);
      setSnackbar({
        open: true,
        message: "Failed to report post",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const filteredPosts = posts.filter((post) => {
    if (tabValue === 1) return post.isAnnouncement;
    if (tabValue === 2) return post.likesCount > 15;
    return true;
  });

  if (loading && posts.length === 0) {
    return (
      <Container
        maxWidth="md"
        sx={{ py: 4, display: "flex", justifyContent: "center" }}
      >
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom fontWeight={700}>
        Community
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Create Post */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stack direction="row" spacing={2}>
            <Avatar src={profilePhoto} sx={{ width: 48, height: 48 }}>
              {!profilePhoto ? name?.[0] : "U"}
            </Avatar>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Share your thoughts, ask questions, or celebrate achievements..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              variant="outlined"
              disabled={isSubmitting}
            />
          </Stack>
        </CardContent>
        <Divider />
        <CardActions sx={{ px: 3, py: 1.5 }}>
          <Stack direction="row" spacing={1} flexGrow={1}>
            <IconButton size="small" color="primary" disabled={isSubmitting}>
              <PhotoCamera />
            </IconButton>
            <IconButton size="small" color="primary" disabled={isSubmitting}>
              <VideoCall />
            </IconButton>
          </Stack>
          <Button
            variant="contained"
            disabled={!newPost.trim() || isSubmitting}
            sx={{ borderRadius: 8 }}
            onClick={handleCreatePost}
            startIcon={
              isSubmitting ? <CircularProgress size={16} /> : undefined
            }
          >
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </CardActions>
      </Card>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
        <Tab label="All Posts" />
        <Tab label="Announcements" />
        <Tab label="Trending" icon={<TrendingUp />} iconPosition="end" />
      </Tabs>

      {/* Posts */}
      <AnimatePresence>
        {filteredPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onToggleLike={handleToggleLike}
            onEdit={handleEditPost}
            onDelete={handleDeletePost}
            onReport={handleReportPost}
            currentUserId={currentUserId}
          />
        ))}
      </AnimatePresence>

      {filteredPosts.length === 0 && !loading && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No posts found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Be the first to share something!
          </Typography>
        </Box>
      )}

      {loading && posts.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};
