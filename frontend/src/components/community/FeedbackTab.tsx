import React from "react";
import { Box, CircularProgress, Typography, Stack, Fade } from "@mui/material";
import { AnimatePresence } from "framer-motion";
import { PostCard } from "./PostCard";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import { SnackbarSeverity } from "../../hooks/useSnackbar";

interface Feedback {
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

interface FeedbackTabProps {
  feedback: Feedback[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  currentUserId?: string;
  highlightedItemId: string | null;
  onLoadMore: () => void;
  onToggleLike: (itemId: string) => void;
  onEdit: (itemId: string, newContent: string, mediaUrls?: string[]) => void;
  onDelete: (itemId: string) => void;
  onReport: (itemId: string, reason: string) => void;
  onShowSnackbar: (message: string, severity: SnackbarSeverity) => void;
}

export const FeedbackTab: React.FC<FeedbackTabProps> = ({
  feedback,
  loading,
  loadingMore,
  hasMore,
  currentUserId,
  highlightedItemId,
  onLoadMore,
  onToggleLike,
  onEdit,
  onDelete,
  onReport,
  onShowSnackbar,
}) => {
  useInfiniteScroll(onLoadMore, hasMore, loadingMore);

  // Show loading only on initial load
  if (loading && feedback.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {/* Items */}
      <AnimatePresence>
        {feedback.map((feedbackItem) => (
          <PostCard
            key={feedbackItem.id}
            post={{
              ...feedbackItem,
              isAnnouncement: false,
              isFeedback: true,
              mediaUrls: feedbackItem.mediaUrls || [],
            }}
            onToggleLike={() => onToggleLike(feedbackItem.id)}
            onEdit={onEdit}
            onDelete={onDelete}
            onReport={onReport}
            currentUserId={currentUserId}
            onShowSnackbar={onShowSnackbar}
            isHighlighted={highlightedItemId === feedbackItem.id}
            currentTab={2}
          />
        ))}
      </AnimatePresence>

      {feedback.length === 0 && !loading && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No feedback found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Be the first to share your feedback!
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
                Loading more feedback...
              </Typography>
            </Stack>
          </Box>
        </Fade>
      )}

      {/* End of Items Indicator */}
      {!hasMore && feedback.length > 0 && !loading && (
        <Fade in={true}>
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              🎉 You've reached the end!
            </Typography>
          </Box>
        </Fade>
      )}
    </>
  );
};
