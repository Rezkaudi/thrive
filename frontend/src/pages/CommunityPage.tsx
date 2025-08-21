// frontend/src/pages/CommunityPage.tsx - Updated to dedicate the input card for posts
import React, { useState, useEffect, useCallback } from "react";
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
  LinearProgress,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  ThumbUp,
  Comment,
  Share,
  PhotoCamera,
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
  Send,
  AttachFile,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Comments } from "../components/community/Comments";
import {
  MediaUpload,
  SelectedMedia,
} from "../components/community/MediaUpload";
import { PostMedia } from "../components/community/PostMedia";
import { AppDispatch, RootState } from "../store/store";
import {
  createPost,
  deletePost,
  editPost,
  fetchPosts,
  loadMorePosts,
  toggleCommentsSection,
  toggleLike,
  resetPosts,
} from "../store/slices/communitySlice";
import {
  fetchAnnouncements,
  loadMoreAnnouncements,
  toggleAnnouncementLike,
  editAnnouncement,
  deleteAnnouncement,
  resetAnnouncements,
  toggleAnnouncementCommentsSection,
} from "../store/slices/announcementSlice";
import { clearError } from "../store/slices/authSlice";
import { linkifyText } from "../utils/linkify";
import { communityService } from "../services/communityService";

// Unified interface for both posts and announcements
interface ComponentItem {
  id: string;
  author?: {
    userId: string;
    name: string;
    email: string;
    avatar: string;
    level?: number;
  };
  content: string;
  mediaUrls?: string[];
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

interface ItemCardProps {
  item: ComponentItem;
  onToggleLike: (itemId: string) => void;
  onEdit: (itemId: string, newContent: string, mediaUrls?: string[]) => void;
  onDelete: (itemId: string) => void;
  onReport: (itemId: string, reason: string) => void;
  currentUserId?: string;
  onShowSnackbar: (
    message: string,
    severity: "success" | "error" | "info" | "warning"
  ) => void;
  isHighlighted?: boolean;
}

const ItemCard = ({
  item,
  onToggleLike,
  onEdit,
  onDelete,
  onReport,
  currentUserId,
  onShowSnackbar,
  isHighlighted = false,
}: ItemCardProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(item.content);
  const [editSelectedMedia, setEditSelectedMedia] = useState<SelectedMedia[]>(
    []
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareDialog, setShareDialog] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [mediaExpanded, setMediaExpanded] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const shareToSocial = (platform: string) => {
    const message = `Check out this ${
      item.isAnnouncement ? "announcement" : "post"
    } from the Thrive in Japan community!`;
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
  const isOwnItem = currentUserId === item.author?.userId;

  // Initialize edit media from existing URLs (only for posts)
  useEffect(() => {
    if (
      isEditing &&
      !item.isAnnouncement &&
      editSelectedMedia.length === 0 &&
      item.mediaUrls &&
      item.mediaUrls.length > 0
    ) {
      const existingMedia: SelectedMedia[] = item.mediaUrls.map(
        (url, index) => ({
          id: `existing-${index}-${Date.now()}`,
          preview: url,
          file: new File([], `existing-${index}`, {
            type:
              url.includes(".mp4") || url.includes(".mov")
                ? "video/mp4"
                : "image/jpeg",
          }),
        })
      );
      setEditSelectedMedia(existingMedia);
    }
  }, [
    isEditing,
    item.isAnnouncement,
    item.mediaUrls,
    editSelectedMedia.length,
  ]);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(item.content);
    setEditSelectedMedia([]);
    handleMenuClose();
  };

  const handleShareClick = () => {
    const itemUrl = `${window.location.origin}/community?highlight=${item.id}`;
    setShareUrl(itemUrl);
    setShareDialog(true);
  };

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    onShowSnackbar(
      `${
        item.isAnnouncement ? "Announcement" : "Post"
      } URL copied to clipboard!`,
      "success"
    );
  };

  const handleSaveEdit = async () => {
    if (
      editContent.trim() ||
      (!item.isAnnouncement && editSelectedMedia.length > 0)
    ) {
      try {
        let mediaUrls: string[] = [];

        // Handle media for posts only
        if (!item.isAnnouncement && editSelectedMedia.length > 0) {
          const newFiles = editSelectedMedia.filter(
            (media) => !media.preview.startsWith("http") && media.file.size > 0
          );

          if (newFiles.length > 0) {
            const files = newFiles.map((media) => media.file);
            const uploadResponse = await communityService.uploadMedia(files);
            mediaUrls.push(...uploadResponse.files.map((file) => file.url));
          }

          const existingUrls = editSelectedMedia
            .filter((media) => media.preview.startsWith("http"))
            .map((media) => media.preview);
          mediaUrls.push(...existingUrls);
        }

        // Call appropriate edit function based on item type
        if (item.isAnnouncement) {
          await onEdit(item.id, editContent);
        } else {
          await onEdit(item.id, editContent, mediaUrls);
        }

        setIsEditing(false);
        setEditSelectedMedia([]);
      } catch (error) {
        setEditContent(item.content);
        setEditSelectedMedia([]);
        console.error("Failed to save edit:", error);
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(item.content);
    setEditSelectedMedia([]);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    try {
      await onDelete(item.id);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error(
        `Failed to delete ${item.isAnnouncement ? "announcement" : "post"}:`,
        error
      );
    }
  };

  const handleReportClick = () => {
    setReportDialogOpen(true);
    setReportReason("");
    handleMenuClose();
  };

  const handleReportSubmit = () => {
    if (reportReason.trim()) {
      onReport(item.id, reportReason);
      setReportDialogOpen(false);
      setReportReason("");
    }
  };

  const handleCommentsToggle = () => {
    if (!commentsOpen) {
      if (item.isAnnouncement) {
        dispatch(toggleAnnouncementCommentsSection(item.id));
      } else {
        dispatch(toggleCommentsSection(item.id));
      }
    }
    setCommentsOpen(!commentsOpen);
  };

  const handleEditMediaChange = (mediaFiles: SelectedMedia[]) => {
    setEditSelectedMedia(mediaFiles);
  };

  const displayCommentsCount =
    item.commentsCount !== undefined
      ? item.commentsCount
      : item.commentsInitialized
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
        id={`${item.isAnnouncement ? "announcement" : "post"}-${item.id}`}
        sx={{
          mb: 3,
          position: "relative",
          opacity: item.isDeleting ? 0.5 : 1,
          ...(item.isAnnouncement && {
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
        {item.isDeleting && (
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
                item.author?.level ? `L${item.author.level}` : undefined
              }
              color="primary"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
              <Avatar
                src={item.author?.avatar}
                sx={{ width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 } }}
              >
                {!item.author?.avatar && item.author?.name?.[0]}
              </Avatar>
            </Badge>
            <Box flexGrow={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Link
                  to={`/profile/${item.author?.userId}`}
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
                    {item.author?.name || "Unknown User"}
                  </Typography>
                </Link>
                {item.isAnnouncement && (
                  <Chip
                    icon={<Campaign />}
                    label="Announcement"
                    size="small"
                    color="primary"
                  />
                )}
                {(item.isEditing || isEditing) && (
                  <Chip
                    label="Editing..."
                    size="small"
                    color="info"
                    variant="outlined"
                  />
                )}
              </Stack>
              <Typography
                sx={{ fontSize: { xs: "0.5rem", md: "0.8rem" } }}
                color="text.secondary"
              >
                {item.author?.email} • {formatPostDate(item.createdAt)}{" "}
                {formatPostTime(item.createdAt)}
              </Typography>
            </Box>

            <IconButton
              size="small"
              onClick={handleMenuClick}
              disabled={item.isDeleting}
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
              {isOwnItem && (
                <MenuItem
                  onClick={handleEdit}
                  disabled={item.isEditing || isEditing}
                >
                  <ListItemIcon>
                    <Edit fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Edit</ListItemText>
                </MenuItem>
              )}

              {isOwnItem && (
                <MenuItem
                  onClick={handleDeleteClick}
                  sx={{ color: "error.main" }}
                  disabled={item.isDeleting}
                >
                  <ListItemIcon>
                    <Delete fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText>Delete</ListItemText>
                </MenuItem>
              )}

              {!isOwnItem && (
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

          {/* Content - Editable or Display */}
          {isEditing ? (
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={isMobile ? 3 : 4}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                variant="outlined"
                sx={{ mb: 2 }}
                disabled={item.isEditing}
                placeholder={`Edit your ${
                  item.isAnnouncement ? "announcement" : "post"
                } content...`}
              />

              {/* Media Upload Section for Editing (Posts only) */}
              {!item.isAnnouncement && (
                <Box sx={{ mb: 2 }}>
                  <Button
                    size="small"
                    onClick={() => setMediaExpanded(!mediaExpanded)}
                    endIcon={mediaExpanded ? <ExpandLess /> : <ExpandMore />}
                    sx={{ mb: 1 }}
                  >
                    Media ({editSelectedMedia.length})
                  </Button>
                  <Collapse in={mediaExpanded}>
                    <MediaUpload
                      onMediaChange={handleEditMediaChange}
                      selectedMedia={editSelectedMedia}
                      maxFiles={5}
                      disabled={item.isEditing}
                    />
                  </Collapse>
                </Box>
              )}

              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={
                    item.isEditing ? <CircularProgress size={16} /> : <Save />
                  }
                  onClick={handleSaveEdit}
                  disabled={
                    (!editContent.trim() &&
                      (!item.isAnnouncement
                        ? editSelectedMedia.length === 0
                        : true)) ||
                    item.isEditing
                  }
                >
                  {item.isEditing ? "Saving..." : "Save"}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={handleCancelEdit}
                  disabled={item.isEditing}
                >
                  Cancel
                </Button>
              </Stack>
            </Box>
          ) : (
            <Typography variant="body1" sx={{ mb: 2, whiteSpace: "pre-wrap" }}>
              {linkifyText(item.content)}
            </Typography>
          )}

          {/* Media Display (Posts only) */}
          {!item.isAnnouncement &&
            item.mediaUrls &&
            item.mediaUrls.length > 0 &&
            !isEditing && <PostMedia mediaUrls={item.mediaUrls} />}
        </CardContent>

        <Divider />

        <CardActions sx={{ px: 2 }}>
          <Stack direction="row" spacing={2} flexGrow={1}>
            <Button
              startIcon={<ThumbUp />}
              size="small"
              color={item.isLiked ? "primary" : "inherit"}
              sx={{ textTransform: "none", p: { xs: 1, md: 2 } }}
              onClick={() => onToggleLike(item.id)}
              disabled={item.isDeleting}
            >
              {item.likesCount} {item.likesCount === 1 ? "Like" : "Likes"}
            </Button>
            <Button
              startIcon={<Comment />}
              size="small"
              sx={{ textTransform: "none", p: { xs: 1, md: 2 } }}
              onClick={handleCommentsToggle}
              disabled={item.isDeleting}
              color={commentsOpen ? "primary" : "inherit"}
            >
              {displayCommentsCount}{" "}
              {displayCommentsCount === 1 ? "Comment" : "Comments"}
            </Button>
            <Button
              startIcon={<Share />}
              size="small"
              sx={{ textTransform: "none", p: { xs: 1, md: 2 } }}
              onClick={handleShareClick}
              disabled={item.isDeleting}
            >
              Share
            </Button>
          </Stack>
        </CardActions>

        {/* Comments Section */}
        <Comments
          postId={item.id}
          commentsCount={item.commentsCount}
          isOpen={commentsOpen}
          onToggle={handleCommentsToggle}
          isAnnouncement={item.isAnnouncement}
        />
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          Delete {item.isAnnouncement ? "Announcement" : "Post"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this{" "}
            {item.isAnnouncement ? "announcement" : "post"}? This action cannot
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={item.isDeleting}
            startIcon={
              item.isDeleting ? <CircularProgress size={16} /> : undefined
            }
          >
            {item.isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Dialog */}
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
            Share This {item.isAnnouncement ? "Announcement" : "Post"}
            <IconButton onClick={() => setShareDialog(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Share this {item.isAnnouncement ? "announcement" : "post"} - the
                link will open the community page and highlight this{" "}
                {item.isAnnouncement ? "announcement" : "post"}
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
        <DialogTitle>
          Report {item.isAnnouncement ? "Announcement" : "Post"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please provide a reason for reporting this{" "}
            {item.isAnnouncement ? "announcement" : "post"}:
          </DialogContentText>
          <TextField
            fullWidth
            multiline
            rows={isMobile ? 3 : 4}
            placeholder={`Describe why you're reporting this ${
              item.isAnnouncement ? "announcement" : "post"
            }...`}
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
const useInfiniteScroll = (
  callback: () => void,
  hasMore: boolean,
  loading: boolean
) => {
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop <
        document.documentElement.offsetHeight - 1000
      ) {
        return;
      }
      if (hasMore && !loading && !isFetching) {
        setIsFetching(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });
  const [mediaExpanded, setMediaExpanded] = useState(false);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(
    null
  );
  const [dragOver, setDragOver] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  // Community state (posts)
  const {
    posts,
    loading: postsLoading,
    loadingMore: postsLoadingMore,
    hasMorePosts,
    error: postsError,
    editError: postsEditError,
    deleteError: postsDeleteError,
    commentError: postsCommentError,
    currentPage: postsCurrentPage,
    totalPosts,
  } = useSelector((state: RootState) => state.community);

  // Announcements state
  const {
    announcements,
    loading: announcementsLoading,
    loadingMore: announcementsLoadingMore,
    hasMoreAnnouncements,
    error: announcementsError,
    editError: announcementsEditError,
    deleteError: announcementsDeleteError,
    commentError: announcementsCommentError,
    currentPage: announcementsCurrentPage,
    totalAnnouncements,
  } = useSelector((state: RootState) => state.announcements);

  const profilePhoto = useSelector(
    (state: RootState) => state.dashboard.data?.user.profilePhoto
  );
  const name = useSelector(
    (state: RootState) => state.dashboard.data?.user.name
  );
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
  const userRole = useSelector((state: RootState) => state.auth.user?.role);

  // Determine current loading state and hasMore based on active tab
  const loading = tabValue === 0 ? announcementsLoading : postsLoading;
  const loadingMore =
    tabValue === 0 ? announcementsLoadingMore : postsLoadingMore;
  const hasMore = tabValue === 0 ? hasMoreAnnouncements : hasMorePosts;
  const error = tabValue === 0 ? announcementsError : postsError;
  const editError = tabValue === 0 ? announcementsEditError : postsEditError;
  const deleteError =
    tabValue === 0 ? announcementsDeleteError : postsDeleteError;
  const commentError =
    tabValue === 0 ? announcementsCommentError : postsCommentError;

  // Infinite scroll callback
  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      if (tabValue === 0) {
        dispatch(loadMoreAnnouncements());
      } else {
        dispatch(loadMorePosts());
      }
    }
  }, [dispatch, hasMore, loadingMore, tabValue]);

  const [isFetching] = useInfiniteScroll(loadMore, hasMore, loadingMore);

  // Fetch initial data when component mounts
  useEffect(() => {
    dispatch(fetchAnnouncements({ page: 1, limit: 20 }));
    dispatch(fetchPosts({ page: 1, limit: 20 }));
  }, [dispatch]);

  // Reset data when changing tabs
  useEffect(() => {
    if (tabValue === 0) {
      dispatch(resetAnnouncements());
      dispatch(fetchAnnouncements({ page: 1, limit: 20 }));
    } else {
      dispatch(resetPosts());
      dispatch(fetchPosts({ page: 1, limit: 20 }));
    }
  }, [tabValue, dispatch]);

  // Handle URL highlight parameter for shared items
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const highlightParam = urlParams.get("highlight");

    if (highlightParam) {
      setHighlightedItemId(highlightParam);

      const timer = setTimeout(() => {
        const itemElement =
          document.getElementById(`post-${highlightParam}`) ||
          document.getElementById(`announcement-${highlightParam}`);
        if (itemElement) {
          itemElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          setTimeout(() => {
            setHighlightedItemId(null);
            const newUrl = window.location.pathname;
            window.history.replaceState({}, "", newUrl);
          }, 3000);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [posts, announcements]);

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

  // Enhanced handleCreatePost - only creates posts (not announcements)
  const handleCreatePost = async () => {
    if (!newPost.trim() && selectedMedia.length === 0) return;

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      let mediaUrls: string[] = [];

      // Upload media files if any are selected
      if (selectedMedia.length > 0) {
        setUploadProgress(25);

        const files = selectedMedia.map((media) => media.file);
        const uploadResponse = await communityService.uploadMedia(files);

        setUploadProgress(75);
        mediaUrls = uploadResponse.files.map((file) => file.url);
      }

      // Create the post with uploaded media URLs
      setUploadProgress(90);
      await dispatch(
        createPost({
          content: newPost || " ",
          mediaUrls,
        })
      ).unwrap();

      // Clean up
      selectedMedia.forEach((media) => {
        if (media.preview && media.preview.startsWith("blob:")) {
          URL.revokeObjectURL(media.preview);
        }
      });

      setNewPost("");
      setSelectedMedia([]);
      setMediaExpanded(false);
      setUploadProgress(100);

      handleShowSnackbar("Post created successfully!", "success");
    } catch (error) {
      console.error("Failed to create post:", error);
      handleShowSnackbar("Failed to create post", "error");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleToggleLike = (itemId: string) => {
    // Determine if it's an announcement or post based on current tab
    if (tabValue === 0) {
      dispatch(toggleAnnouncementLike(itemId));
    } else {
      dispatch(toggleLike(itemId));
    }
  };

  const handleEditItem = async (
    itemId: string,
    newContent: string,
    mediaUrls?: string[]
  ) => {
    try {
      if (tabValue === 0) {
        // Edit announcement
        await dispatch(
          editAnnouncement({ announcementId: itemId, content: newContent })
        ).unwrap();
      } else {
        // Edit post
        await dispatch(
          editPost({ postId: itemId, content: newContent, mediaUrls })
        ).unwrap();
      }
      handleShowSnackbar(
        `${tabValue === 0 ? "Announcement" : "Post"} updated successfully!`,
        "success"
      );
    } catch (error: any) {
      handleShowSnackbar(
        error || `Failed to edit ${tabValue === 0 ? "announcement" : "post"}`,
        "error"
      );
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      if (tabValue === 0) {
        // Delete announcement
        await dispatch(deleteAnnouncement(itemId)).unwrap();
      } else {
        // Delete post
        await dispatch(deletePost(itemId)).unwrap();
      }
      handleShowSnackbar(
        `${tabValue === 0 ? "Announcement" : "Post"} deleted successfully!`,
        "success"
      );
    } catch (error: any) {
      handleShowSnackbar(
        error || `Failed to delete ${tabValue === 0 ? "announcement" : "post"}`,
        "error"
      );
    }
  };

  const handleReportItem = async (itemId: string, reason: string) => {
    try {
      handleShowSnackbar(
        `${tabValue === 0 ? "Announcement" : "Post"} reported successfully!`,
        "info"
      );
    } catch (error) {
      console.error(
        `Failed to report ${tabValue === 0 ? "announcement" : "post"}:`,
        error
      );
      handleShowSnackbar(
        `Failed to report ${tabValue === 0 ? "announcement" : "post"}`,
        "error"
      );
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleMediaChange = (mediaFiles: SelectedMedia[]) => {
    setSelectedMedia(mediaFiles);
  };

  const handleClearPost = () => {
    selectedMedia.forEach((media) => {
      if (media.preview && media.preview.startsWith("blob:")) {
        URL.revokeObjectURL(media.preview);
      }
    });
    setNewPost("");
    setSelectedMedia([]);
    setMediaExpanded(false);
  };

  // Drag and drop for the entire post creation area
  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragOver(false);

      if (isSubmitting) return; // Simplified check

      const files = Array.from(event.dataTransfer.files);
      if (files.length > 0) {
        const currentMedia = [...selectedMedia];
        const validFiles: SelectedMedia[] = [];

        files.forEach((file) => {
          if (currentMedia.length + validFiles.length < 5) {
            const fileId = `${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}`;
            validFiles.push({
              file,
              preview: URL.createObjectURL(file),
              id: fileId,
            });
          }
        });

        if (validFiles.length > 0) {
          setSelectedMedia([...currentMedia, ...validFiles]);
          setMediaExpanded(true);
        }
      }
    },
    [selectedMedia, isSubmitting]
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!isSubmitting) { // Simplified check
        setDragOver(true);
      }
    },
    [isSubmitting]
  );

  const handleDragLeave = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX;
      const y = event.clientY;

      if (
        x < rect.left ||
        x >= rect.right ||
        y < rect.top ||
        y >= rect.bottom
      ) {
        setDragOver(false);
      }
    },
    []
  );

  // Get filtered items based on current tab
  const getFilteredItems = (): ComponentItem[] => {
    if (tabValue === 0) {
      return announcements.map((announcement) => ({
        ...announcement,
        isAnnouncement: true,
        mediaUrls: [],
      }));
    } else {
      return posts.map((post) => ({
        ...post,
        isAnnouncement: false,
        mediaUrls: post.mediaUrls || [],
      }));
    }
  };

  const filteredItems = getFilteredItems();

  const hasContent = newPost.trim() || selectedMedia.length > 0;
  // **MODIFIED**: Simplified postButtonText to remove announcement logic
  const postButtonText =
    selectedMedia.length > 0
      ? `Post with ${selectedMedia.length} ${
          selectedMedia.length === 1 ? "file" : "files"
        }`
      : "Post";

  // Show loading only on initial load
  if (loading && filteredItems.length === 0) {
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
    <Container
      maxWidth="md"
      sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}
    >
      <Typography variant="h3" gutterBottom fontWeight={700}>
        Community
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* **MODIFIED**: Enhanced Create Post Card (now only shows for posts tab) */}
      {tabValue === 1 && (
        <Card
          sx={{
            mb: 4,
            position: "relative",
            overflow: "visible",
            border: dragOver ? "2px dashed" : "1px solid",
            borderColor: dragOver ? "primary.main" : "divider",
            bgcolor: dragOver ? "primary.50" : "background.paper",
            transition: "all 0.3s ease",
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {/* Upload progress bar */}
          {isSubmitting && uploadProgress > 0 && (
            <LinearProgress
              variant="determinate"
              value={uploadProgress}
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                zIndex: 1,
              }}
            />
          )}

          <CardContent sx={{ pb: 1 }}>
            <Stack direction="row" spacing={2} mb={2}>
              <Avatar src={profilePhoto} sx={{ width: 48, height: 48 }}>
                {!profilePhoto ? name?.[0] : "U"}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={hasContent ? 3 : 2}
                  // **MODIFIED**: Simplified placeholder text
                  placeholder={
                    dragOver
                      ? "Drop files here or type your message..."
                      : "Share your thoughts, ask questions, or celebrate achievements..."
                  }
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  variant="outlined"
                  disabled={isSubmitting}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      fontSize: "1rem",
                      bgcolor: dragOver ? "primary.50" : "background.paper",
                      transition: "all 0.3s ease",
                    },
                  }}
                />

                {/* Media attachment indicator */}
                {selectedMedia.length > 0 && !mediaExpanded && (
                  <Box sx={{ mt: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AttachFile />}
                      endIcon={
                        mediaExpanded ? <ExpandLess /> : <ExpandMore />
                      }
                      onClick={() => setMediaExpanded(!mediaExpanded)}
                      sx={{
                        borderRadius: 6,
                        bgcolor: "success.50",
                        borderColor: "success.main",
                        color: "success.main",
                        "&:hover": {
                          bgcolor: "success.100",
                        },
                      }}
                    >
                      {selectedMedia.length}{" "}
                      {selectedMedia.length === 1 ? "file" : "files"} attached
                    </Button>
                  </Box>
                )}
              </Box>
            </Stack>

            {/* Media Upload Section */}
            <Collapse in={mediaExpanded}>
              <Box sx={{ mb: 2 }}>
                <MediaUpload
                  onMediaChange={handleMediaChange}
                  selectedMedia={selectedMedia}
                  maxFiles={5}
                  disabled={isSubmitting}
                  showPreview={true}
                />
              </Box>
            </Collapse>

            {dragOver && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: "rgba(25, 118, 210, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 2,
                  borderRadius: 1,
                }}
              >
                <Paper
                  sx={{
                    p: 3,
                    textAlign: "center",
                    bgcolor: "primary.main",
                    color: "white",
                    borderRadius: 2,
                  }}
                >
                  <AttachFile sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h6" fontWeight={600}>
                    Drop files to attach
                  </Typography>
                  <Typography variant="body2">
                    They'll be uploaded when you post
                  </Typography>
                </Paper>
              </Box>
            )}
          </CardContent>

          <Divider />

          <CardActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Add photos/videos">
                <IconButton
                  size="medium"
                  color="primary"
                  disabled={isSubmitting}
                  onClick={() => setMediaExpanded(!mediaExpanded)}
                  sx={{
                    "&:hover": {
                      bgcolor: "primary.50",
                      transform: "scale(1.1)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <Badge
                    badgeContent={selectedMedia.length || null}
                    color="secondary"
                  >
                    <PhotoCamera />
                  </Badge>
                </IconButton>
              </Tooltip>

              {hasContent && (
                <Tooltip title="Clear post">
                  <IconButton
                    size="medium"
                    color="error"
                    disabled={isSubmitting}
                    onClick={handleClearPost}
                    sx={{
                      "&:hover": {
                        bgcolor: "error.50",
                        transform: "scale(1.1)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Close />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              {isSubmitting && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={16} />
                  <Typography variant="caption" color="text.secondary">
                    {/* **MODIFIED**: Simplified loading text */}
                    {uploadProgress < 25
                      ? "Preparing..."
                      : uploadProgress < 75
                      ? "Uploading media..."
                      : uploadProgress < 95
                      ? "Creating post..."
                      : "Almost done..."}
                  </Typography>
                </Stack>
              )}

              <Button
                variant="contained"
                disabled={!hasContent || isSubmitting}
                onClick={handleCreatePost}
                startIcon={isSubmitting ? undefined : <Send />}
                sx={{
                  borderRadius: 8,
                  minWidth: 120,
                  fontWeight: 600,
                  // **MODIFIED**: Simplified button color logic
                  bgcolor:
                    selectedMedia.length > 0
                      ? "success.main"
                      : "primary.main",
                  "&:hover": {
                    bgcolor:
                      selectedMedia.length > 0
                        ? "success.dark"
                        : "primary.dark",
                    transform: "translateY(-1px)",
                    boxShadow: 3,
                  },
                  "&:disabled": {
                    bgcolor: "action.disabledBackground",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  postButtonText
                )}
              </Button>
            </Stack>
          </CardActions>
        </Card>
      )}

      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={(e, v) => setTabValue(v)}
        sx={{ mb: 3 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab
          label={`Announcements`}
          icon={<Campaign />}
          iconPosition="start"
        />
        <Tab label={`Community Posts`} />
      </Tabs>

      {/* Items */}
      <AnimatePresence>
        {filteredItems.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onToggleLike={handleToggleLike}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
            onReport={handleReportItem}
            currentUserId={currentUserId}
            onShowSnackbar={handleShowSnackbar}
            isHighlighted={highlightedItemId === item.id}
          />
        ))}
      </AnimatePresence>

      {filteredItems.length === 0 && !loading && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No {tabValue === 0 ? "announcements" : "posts"} found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {tabValue === 0
              ? userRole === "ADMIN"
                ? "No announcements yet." // Modified this for clarity
                : "No announcements yet."
              : "Be the first to share something!"}
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
                Loading more {tabValue === 0 ? "announcements" : "posts"}...
              </Typography>
            </Stack>
          </Box>
        </Fade>
      )}

      {/* End of Items Indicator */}
      {!hasMore && filteredItems.length > 0 && !loading && (
        <Fade in={true}>
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              🎉 You've reached the end!
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