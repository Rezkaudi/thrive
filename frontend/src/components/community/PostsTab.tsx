import React from "react";
import { Box, CircularProgress, Typography, Stack, Fade } from "@mui/material";
import { AnimatePresence } from "framer-motion";
import { PostCard } from "./PostCard";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import { SnackbarSeverity } from "../../hooks/useSnackbar";

interface Post {
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

interface PostsTabProps {
  posts: Post[];
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

export const PostsTab: React.FC<PostsTabProps> = ({
  posts,
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
  if (loading && posts.length === 0) {
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
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={{
              ...post,
              isAnnouncement: false,
              isFeedback: false,
              mediaUrls: post.mediaUrls || [],
            }}
            onToggleLike={() => onToggleLike(post.id)}
            onEdit={onEdit}
            onDelete={onDelete}
            onReport={onReport}
            currentUserId={currentUserId}
            onShowSnackbar={onShowSnackbar}
            isHighlighted={highlightedItemId === post.id}
            currentTab={1}
          />
        ))}
      </AnimatePresence>

      {posts.length === 0 && !loading && (
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

      {/* End of Items Indicator */}
      {!hasMore && posts.length > 0 && !loading && (
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
