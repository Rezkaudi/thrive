import React from "react";
import { Stack, Button } from "@mui/material";
import { ThumbUp, Comment, Share } from "@mui/icons-material";

interface PostCardActionsProps {
  isLiked: boolean;
  likesCount: number;
  commentsCount: number | string;
  isDeleting: boolean;
  commentsOpen: boolean;
  onToggleLike: () => void;
  onToggleComments: () => void;
  onShare: () => void;
}

export const PostCardActions: React.FC<PostCardActionsProps> = ({
  isLiked,
  likesCount,
  commentsCount,
  isDeleting,
  commentsOpen,
  onToggleLike,
  onToggleComments,
  onShare,
}) => {
  return (
    <Stack direction="row" spacing={2} flexGrow={1}>
      <Button
        startIcon={<ThumbUp />}
        size="small"
        color={isLiked ? "primary" : "inherit"}
        sx={{ textTransform: "none", p: { xs: 1, md: 2 } }}
        onClick={onToggleLike}
        disabled={isDeleting}
      >
        {likesCount} {likesCount === 1 ? "Like" : "Likes"}
      </Button>
      <Button
        startIcon={<Comment />}
        size="small"
        sx={{ textTransform: "none", p: { xs: 1, md: 2 } }}
        onClick={onToggleComments}
        disabled={isDeleting}
        color={commentsOpen ? "primary" : "inherit"}
      >
        {commentsCount} {commentsCount === 1 ? "Comment" : "Comments"}
      </Button>
      <Button
        startIcon={<Share />}
        size="small"
        sx={{ textTransform: "none", p: { xs: 1, md: 2 } }}
        onClick={onShare}
        disabled={isDeleting}
      >
        Share
      </Button>
    </Stack>
  );
};

export default PostCardActions;
