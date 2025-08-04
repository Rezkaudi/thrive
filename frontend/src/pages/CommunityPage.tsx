// frontend/src/pages/CommunityPage.tsx - With Infinite Scroll Pagination
import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Collapse,
  Fade,
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
  ExpandMore,
  ExpandLess,
  ContentCopy,
  Close,
  Facebook,
  Twitter,
  LinkedIn,
  WhatsApp,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Comments } from "../components/community/Comments";
import {
  MediaUpload,
  UploadedMedia,
} from "../components/community/MediaUpload";
import { PostMedia } from "../components/community/PostMedia";
import { AppDispatch, RootState } from "../store/store";
import {
  createPost,
  deletePost,
  editPost,
  fetchCommentCount,
  fetchPosts,
  loadMorePosts, // New action
  toggleCommentsSection,
  toggleLike,
  resetPosts, // New action to reset posts when changing tabs
} from "../store/slices/communitySlice";
import { clearError } from "../store/slices/authSlice";
import { linkifyText } from "../utils/linkify";

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
  onShowSnackbar: (
    message: string,
    severity: "success" | "error" | "info" | "warning"
  ) => void;
  isHighlighted?: boolean;
}

const PostCard = ({
  post,
  onToggleLike,
  onEdit,
  onDelete,
  onReport,
  currentUserId,
  onShowSnackbar,
  isHighlighted = false,
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
  const [shareDialog, setShareDialog] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [mediaExpanded, setMediaExpanded] = useState(false);

  const shareToSocial = (platform: string) => {
    const message = `Check out this post from the Thrive in Japan community!`;
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedMessage = encodeURIComponent(message);

    let platformShareUrl = "";

    switch (platform) {
      case "facebook":
        platformShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "twitter":
        platformShareUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`;
        break;
      case "linkedin":
        platformShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case "whatsapp":
        platformShareUrl = `https://wa.me/?text=${encodedMessage} ${encodedUrl}`;
        break;
    }

    window.open(platformShareUrl, "_blank", "width=600,height=400");
  };

  const menuOpen = Boolean(anchorEl);
  const isOwnPost = currentUserId === post.author?.userId;

  // Convert mediaUrls to UploadedMedia format for editing
  const editExistingMedia: UploadedMedia[] = editMediaUrls.map(
    (url, index) => ({
      url,
      size: 0, // We don't have size info for existing media
      mimeType:
        url.includes(".mp4") || url.includes(".mov") || url.includes(".avi")
          ? "video/mp4"
          : "image/jpeg",
    })
  );

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

  const handleShareClick = () => {
    // Generate URL that opens community page and highlights this specific post
    const postUrl = `${window.location.origin}/community?highlight=${post.id}`;
    setShareUrl(postUrl);
    setShareDialog(true);
  };

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    onShowSnackbar("Post URL copied to clipboard!", "success");
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

  const handleCommentsToggle = () => {
    if (!commentsOpen) {
      dispatch(toggleCommentsSection(post.id));
    }
    setCommentsOpen(!commentsOpen);
  };

  const handleEditMediaUpload = (mediaFiles: UploadedMedia[]) => {
    const urls = mediaFiles.map((file) => file.url);
    setEditMediaUrls([...editMediaUrls, ...urls]);
  };

  const handleEditMediaRemove = (mediaUrl: string) => {
    setEditMediaUrls(editMediaUrls.filter((url) => url !== mediaUrl));
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
        id={`post-${post.id}`}
        sx={{
          mb: 3,
          position: "relative",
          opacity: post.isDeleting ? 0.5 : 1,
          ...(post.isAnnouncement && {
            border: "2px solid",
            borderColor: "primary.main",
          }),
          ...(isHighlighted && {
            border: "2px solid",
            borderColor: "warning.main",
            boxShadow: "0 0 20px #D4BC8C",
            backgroundColor: "warning.50",
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

              {/* Media Upload Section for Editing */}
              <Box sx={{ mb: 2 }}>
                <Button
                  size="small"
                  onClick={() => setMediaExpanded(!mediaExpanded)}
                  endIcon={mediaExpanded ? <ExpandLess /> : <ExpandMore />}
                  sx={{ mb: 1 }}
                >
                  Media ({editMediaUrls.length})
                </Button>
                <Collapse in={mediaExpanded}>
                  <MediaUpload
                    onMediaUpload={handleEditMediaUpload}
                    onMediaRemove={handleEditMediaRemove}
                    existingMedia={editExistingMedia}
                    maxFiles={5}
                    disabled={post.isEditing}
                  />
                </Collapse>
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
              {linkifyText(post.content)}
            </Typography>
          )}

          {/* Media Display */}
          {post.mediaUrls.length > 0 && !isEditing && (
            <PostMedia mediaUrls={post.mediaUrls} />
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
              onClick={handleShareClick}
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

      {/* Share Post Dialog */}
      <Dialog
        open={shareDialog}
        onClose={() => setShareDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            Share This Post
            <IconButton onClick={() => setShareDialog(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Share this post - the link will open the community page and
                highlight this post
              </Typography>
              <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography
                    variant="body2"
                    sx={{ flex: 1, wordBreak: "break-all" }}
                  >
                    {shareUrl}
                  </Typography>
                  <IconButton onClick={copyShareUrl} size="small">
                    <ContentCopy />
                  </IconButton>
                </Stack>
              </Paper>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Share on Social Media
              </Typography>
              <Stack direction="row" spacing={2}>
                <IconButton
                  onClick={() => shareToSocial("facebook")}
                  sx={{
                    bgcolor: "#1877F2",
                    color: "white",
                    "&:hover": { bgcolor: "#166FE5" },
                  }}
                >
                  <Facebook />
                </IconButton>
                <IconButton
                  onClick={() => shareToSocial("twitter")}
                  sx={{
                    bgcolor: "#1DA1F2",
                    color: "white",
                    "&:hover": { bgcolor: "#1A91DA" },
                  }}
                >
                  <Twitter />
                </IconButton>
                <IconButton
                  onClick={() => shareToSocial("linkedin")}
                  sx={{
                    bgcolor: "#0A66C2",
                    color: "white",
                    "&:hover": { bgcolor: "#095BA8" },
                  }}
                >
                  <LinkedIn />
                </IconButton>
                <IconButton
                  onClick={() => shareToSocial("whatsapp")}
                  sx={{
                    bgcolor: "#25D366",
                    color: "white",
                    "&:hover": { bgcolor: "#22C75D" },
                  }}
                >
                  <WhatsApp />
                </IconButton>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
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

// Custom hook for infinite scroll
const useInfiniteScroll = (callback: () => void, hasMore: boolean, loading: boolean) => {
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop < document.documentElement.offsetHeight - 1000) {
        return;
      }
      if (hasMore && !loading && !isFetching) {
        setIsFetching(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading, isFetching]);

  useEffect(() => {
    if (!isFetching) return;
    
    if (hasMore && !loading) {
      callback();
    }
    
    setIsFetching(false);
  }, [isFetching, callback, hasMore, loading]);

  return [isFetching, setIsFetching] as const;
};

export const CommunityPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [newPost, setNewPost] = useState("");
  const [newPostMedia, setNewPostMedia] = useState<UploadedMedia[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });
  const [mediaExpanded, setMediaExpanded] = useState(false);
  const [highlightedPostId, setHighlightedPostId] = useState<string | null>(
    null
  );

  const dispatch = useDispatch<AppDispatch>();
  const {
    posts,
    loading,
    loadingMore, // New loading state
    hasMorePosts, // New state to check if more posts available
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

  // Infinite scroll callback
  const loadMore = useCallback(() => {
    if (hasMorePosts && !loadingMore) {
      dispatch(loadMorePosts());
    }
  }, [dispatch, hasMorePosts, loadingMore]);

  // Use the infinite scroll hook
  const [isFetching] = useInfiniteScroll(loadMore, hasMorePosts, loadingMore);

  // Fetch posts when component mounts
  useEffect(() => {
    dispatch(fetchPosts({ page: 1, limit: 20 }));
  }, [dispatch]);

  // Reset posts when changing tabs
  useEffect(() => {
    // Reset posts and fetch new ones when tab changes
    dispatch(resetPosts());
    dispatch(fetchPosts({ page: 1, limit: 20 }));
  }, [tabValue, dispatch]);

  // Handle URL highlight parameter for shared posts
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const highlightParam = urlParams.get("highlight");

    if (highlightParam) {
      setHighlightedPostId(highlightParam);

      // Scroll to highlighted post after a short delay to ensure posts are loaded
      const timer = setTimeout(() => {
        const postElement = document.getElementById(`post-${highlightParam}`);
        if (postElement) {
          postElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          // Remove highlight after a few seconds
          setTimeout(() => {
            setHighlightedPostId(null);
            // Clean up URL parameter
            const newUrl = window.location.pathname;
            window.history.replaceState({}, "", newUrl);
          }, 3000);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [posts]);

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

  const handleShowSnackbar = (
    message: string,
    severity: "success" | "error" | "info" | "warning"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() && newPostMedia.length === 0) return;

    setIsSubmitting(true);
    try {
      const mediaUrls = newPostMedia.map((media) => media.url);
      await dispatch(
        createPost({
          content: newPost || " ",
          mediaUrls,
        })
      ).unwrap();
      setNewPost("");
      setNewPostMedia([]);
      setMediaExpanded(false);
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

  const handleNewPostMediaUpload = (mediaFiles: UploadedMedia[]) => {
    setNewPostMedia([...newPostMedia, ...mediaFiles]);
  };

  const handleNewPostMediaRemove = (mediaUrl: string) => {
    setNewPostMedia(newPostMedia.filter((media) => media.url !== mediaUrl));
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
          <Stack direction="row" spacing={2} mb={2}>
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

          {/* Media Upload Section */}
          <Box sx={{ mb: 2 }}>
            <Button
              size="small"
              onClick={() => setMediaExpanded(!mediaExpanded)}
              endIcon={mediaExpanded ? <ExpandLess /> : <ExpandMore />}
              startIcon={<PhotoCamera />}
              disabled={isSubmitting}
            >
              Add Media ({newPostMedia.length})
            </Button>
            <Collapse in={mediaExpanded}>
              <Box sx={{ mt: 2 }}>
                <MediaUpload
                  onMediaUpload={handleNewPostMediaUpload}
                  onMediaRemove={handleNewPostMediaRemove}
                  existingMedia={newPostMedia}
                  maxFiles={5}
                  disabled={isSubmitting}
                />
              </Box>
            </Collapse>
          </Box>
        </CardContent>
        <Divider />
        <CardActions sx={{ px: 3, py: 1.5 }}>
          <Stack direction="row" spacing={1} flexGrow={1}>
            <IconButton
              size="small"
              color="primary"
              disabled={isSubmitting}
              onClick={() => setMediaExpanded(!mediaExpanded)}
            >
              <PhotoCamera />
            </IconButton>
            <IconButton
              size="small"
              color="primary"
              disabled={isSubmitting}
              onClick={() => setMediaExpanded(!mediaExpanded)}
            >
              <VideoCall />
            </IconButton>
          </Stack>
          <Button
            variant="contained"
            disabled={
              (!newPost.trim() && newPostMedia.length === 0) || isSubmitting
            }
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
            onShowSnackbar={handleShowSnackbar}
            isHighlighted={highlightedPostId === post.id}
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

      {/* Loading More Indicator */}
      {loadingMore && (
        <Fade in={loadingMore}>
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <Stack alignItems="center" spacing={2}>
              <CircularProgress size={32} />
              <Typography variant="body2" color="text.secondary">
                Loading more posts...
              </Typography>
            </Stack>
          </Box>
        </Fade>
      )}

      {/* End of Posts Indicator */}
      {!hasMorePosts && posts.length > 0 && !loading && (
        <Fade in={true}>
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              🎉 You've reached the end! 
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {posts.length} posts loaded
            </Typography>
          </Box>
        </Fade>
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