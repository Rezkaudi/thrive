import React from "react";
import { Badge, IconButton, Stack, Tooltip } from "@mui/material";
import { PhotoCamera, Close } from "@mui/icons-material";
import { PostButton } from "./PostButton";
import { SelectedMedia } from "./MediaUpload";

interface PostInputActionsProps {
  selectedMedia: SelectedMedia[];
  setMediaExpanded: (v: boolean) => void;
  mediaExpanded: boolean;
  isSubmitting: boolean;
  hasContent: boolean;
  handleClearPost: () => void;
  uploadProgress: number;
  tabValue: number;
  newPost: string;
  onCreatePost: () => Promise<void> | void;
  onShowSnackbar: (
    message: string,
    severity: "success" | "error" | "info" | "warning"
  ) => void;
}

export const PostInputActions = ({
  selectedMedia,
  setMediaExpanded,
  mediaExpanded,
  isSubmitting,
  hasContent,
  handleClearPost,
  uploadProgress,
  tabValue,
  newPost,
  onCreatePost,
  onShowSnackbar,
}: PostInputActionsProps) => {
  return (
    <>
      <Stack direction="row" spacing={1}>
        <Tooltip title="Add photos/videos">
          <IconButton
            size="medium"
            color={tabValue === 2 ? "success" : "primary"}
            disabled={isSubmitting}
            onClick={() => setMediaExpanded(!mediaExpanded)}
            sx={{
              "&:hover": {
                bgcolor: tabValue === 2 ? "success.50" : "primary.50",
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
          <Tooltip title={`Clear ${tabValue === 2 ? "feedback" : "post"}`}>
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
        <PostButton
          newPost={newPost}
          selectedMedia={selectedMedia}
          isSubmitting={isSubmitting}
          uploadProgress={uploadProgress}
          tabValue={tabValue}
          hasContent={hasContent}
          onShowSnackbar={onShowSnackbar}
          onCreatePost={onCreatePost}
        />
      </Stack>
    </>
  );
};

export default PostInputActions;
