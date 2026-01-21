import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Divider,
  TextField,
  Button,
  Box,
  Collapse,
  Backdrop,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Save, Cancel, ExpandLess, ExpandMore } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";
import { toggleCommentsSection } from "../../store/slices/communitySlice";
import { toggleAnnouncementCommentsSection } from "../../store/slices/announcementSlice";
import { toggleFeedbackCommentsSection } from "../../store/slices/feedbackSlice";
import { Comments } from "./Comments";
import { MediaUpload, SelectedMedia } from "./MediaUpload";
import { PostMedia } from "./PostMedia";
import PostCardHeader from "./PostCardHeader";
import PostCardMenu from "./PostCardMenu";
import PostCardActions from "./PostCardActions";
import PostCardDialogs from "./PostCardDialogs";
import { linkifyText } from "../../utils/linkify";

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
  isFeedback?: boolean;
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

interface PostCardProps {
  post: ComponentItem;
  onToggleLike: (itemId: string) => void;
  onEdit: (itemId: string, newContent: string, mediaUrls?: string[]) => void;
  onDelete: (itemId: string) => void;
  onReport: (itemId: string, reason: string) => void;
  currentUserId?: string;
  onShowSnackbar: (
    message: string,
    severity: "success" | "error" | "info" | "warning",
  ) => void;
  isHighlighted?: boolean;
  currentTab: number;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onToggleLike,
  onEdit,
  onDelete,
  onReport,
  currentUserId,
  onShowSnackbar,
  isHighlighted = false,
  currentTab,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editSelectedMedia, setEditSelectedMedia] = useState<SelectedMedia[]>(
    [],
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareDialog, setShareDialog] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [mediaExpanded, setMediaExpanded] = useState(false);

  const isOwnItem = currentUserId === post.author?.userId;
  const menuOpen = Boolean(anchorEl);

  // Initialize edit media from existing URLs
  useEffect(() => {
    if (
      isEditing &&
      !post.isAnnouncement &&
      editSelectedMedia.length === 0 &&
      post.mediaUrls &&
      post.mediaUrls.length > 0
    ) {
      const existingMedia: SelectedMedia[] = post.mediaUrls.map(
        (url, index) => ({
          id: `existing-${index}-${Date.now()}`,
          preview: url,
          file: new File([], `existing-${index}`, {
            type:
              url.includes(".mp4") || url.includes(".mov")
                ? "video/mp4"
                : "image/jpeg",
          }),
        }),
      );
      setEditSelectedMedia(existingMedia);
    }
  }, [
    isEditing,
    post.isAnnouncement,
    post.mediaUrls,
    editSelectedMedia.length,
  ]);

  const getItemType = () => {
    if (post.isAnnouncement) return "announcement";
    if (post.isFeedback) return "feedback";
    return "post";
  };

  const itemType = getItemType();

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(post.content);
    setEditSelectedMedia([]);
    handleMenuClose();
  };

  const handleShareClick = () => {
    const tabParam =
      currentTab === 0
        ? "announcements"
        : currentTab === 1
          ? "posts"
          : "feedback";
    const itemUrl = `${window.location.origin}/community?tab=${tabParam}&highlight=${post.id}`;
    setShareUrl(itemUrl);
    setShareDialog(true);
  };

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    onShowSnackbar(
      `${
        itemType.charAt(0).toUpperCase() + itemType.slice(1)
      } URL copied to clipboard!`,
      "success",
    );
  };

  const shareToSocial = (platform: string) => {
    const message = `Check out this ${itemType} from the Thrive in Japan community!`;
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

  const handleSaveEdit = async () => {
    if (
      editContent.trim() ||
      (!post.isAnnouncement && editSelectedMedia.length > 0)
    ) {
      try {
        let mediaUrls: string[] = [];

        // Handle media for posts and feedback (not announcements)
        if (!post.isAnnouncement && editSelectedMedia.length > 0) {
          const newFiles = editSelectedMedia.filter(
            (media) => !media.preview.startsWith("http") && media.file.size > 0,
          );

          if (newFiles.length > 0) {
            const files = newFiles.map((media) => media.file);
            // Use appropriate service based on post type
            const uploadResponse = post.isFeedback
              ? await (
                  await import("../../services/feedbackService")
                ).feedbackService.uploadMedia(files)
              : await (
                  await import("../../services/communityService")
                ).communityService.uploadMedia(files);
            mediaUrls.push(...uploadResponse.files.map((file) => file.url));
          }

          const existingUrls = editSelectedMedia
            .filter((media) => media.preview.startsWith("http"))
            .map((media) => media.preview);
          mediaUrls.push(...existingUrls);
        }

        // Call appropriate edit function based on post type
        if (post.isAnnouncement) {
          await onEdit(post.id, editContent);
        } else {
          await onEdit(post.id, editContent, mediaUrls);
        }

        setIsEditing(false);
        setEditSelectedMedia([]);
      } catch (error) {
        setEditContent(post.content);
        setEditSelectedMedia([]);
        console.error("Failed to save edit:", error);
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(post.content);
    setEditSelectedMedia([]);
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
      console.error(`Failed to delete ${itemType}:`, error);
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
      if (post.isAnnouncement) {
        dispatch(toggleAnnouncementCommentsSection(post.id));
      } else if (post.isFeedback) {
        dispatch(toggleFeedbackCommentsSection(post.id));
      } else {
        dispatch(toggleCommentsSection(post.id));
      }
    }
    setCommentsOpen(!commentsOpen);
  };

  const handleEditMediaChange = (mediaFiles: SelectedMedia[]) => {
    setEditSelectedMedia(mediaFiles);
  };

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
        id={`${itemType}-${post.id}`}
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
          <PostCardHeader
            userId={post.author?.userId}
            name={post.author?.name}
            avatar={post.author?.avatar}
            level={post.author?.level}
            createdAt={post.createdAt}
            isAnnouncement={post.isAnnouncement}
            isFeedback={post.isFeedback}
            isEditing={isEditing}
            onMenuClick={handleMenuClick}
            isOwnItem={isOwnItem}
            isDeleting={post.isDeleting || false}
          />

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
                disabled={post.isEditing}
                placeholder={`Edit your ${itemType} content...`}
              />

              {!post.isAnnouncement && (
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
                      disabled={post.isEditing}
                      removeButtonDisabled={post.isEditing}
                    />
                  </Collapse>
                </Box>
              )}

              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={
                    post.isEditing ? <CircularProgress size={16} /> : <Save />
                  }
                  onClick={handleSaveEdit}
                  disabled={
                    (!editContent.trim() &&
                      (!post.isAnnouncement
                        ? editSelectedMedia.length === 0
                        : true)) ||
                    post.isEditing
                  }
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
              </Box>
            </Box>
          ) : (
            <Box sx={{ mb: 2, whiteSpace: "pre-wrap" }}>
              {linkifyText(post.content)}
            </Box>
          )}

          {/* Media Display */}
          {!post.isAnnouncement &&
            post.mediaUrls &&
            post.mediaUrls.length > 0 &&
            !isEditing && <PostMedia mediaUrls={post.mediaUrls} />}
        </CardContent>

        <Divider />

        <CardActions sx={{ px: 2 }}>
          <PostCardActions
            isLiked={post.isLiked}
            likesCount={post.likesCount}
            commentsCount={displayCommentsCount}
            isDeleting={post.isDeleting || false}
            commentsOpen={commentsOpen}
            onToggleLike={() => onToggleLike(post.id)}
            onToggleComments={handleCommentsToggle}
            onShare={handleShareClick}
          />
        </CardActions>

        {/* Comments Section */}
        <Comments
          postId={post.id}
          commentsCount={post.commentsCount}
          isOpen={commentsOpen}
          onToggle={handleCommentsToggle}
          isAnnouncement={post.isAnnouncement}
          isFeedback={post.isFeedback}
        />
      </Card>

      {/* Menus and Dialogs */}
      {isOwnItem && (
        <PostCardMenu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          isOwnItem={isOwnItem}
          isEditing={isEditing}
          isDeleting={post.isDeleting || false}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onReport={handleReportClick}
        />
      )}

      <PostCardDialogs
        deleteDialogOpen={deleteDialogOpen}
        reportDialogOpen={reportDialogOpen}
        shareDialogOpen={shareDialog}
        itemType={itemType}
        isDeleting={post.isDeleting || false}
        shareUrl={shareUrl}
        reportReason={reportReason}
        onDeleteDialogClose={() => setDeleteDialogOpen(false)}
        onReportDialogClose={() => setReportDialogOpen(false)}
        onShareDialogClose={() => setShareDialog(false)}
        onDeleteConfirm={handleDeleteConfirm}
        onReportSubmit={handleReportSubmit}
        onCopyShareUrl={copyShareUrl}
        onReportReasonChange={setReportReason}
        onShareToSocial={shareToSocial}
      />
    </motion.div>
  );
};

export default PostCard;
