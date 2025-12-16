import { Button, Stack, Typography, CircularProgress } from "@mui/material";
import { Send } from "@mui/icons-material";
import { SelectedMedia } from "./MediaUpload";

interface IPostButtonProps {
  newPost: string;
  selectedMedia: SelectedMedia[];
  isSubmitting: boolean;
  uploadProgress: number;
  tabValue: number;
  hasContent: boolean;
  onShowSnackbar: (
    message: string,
    severity: "success" | "error" | "info" | "warning"
  ) => void;
  onCreatePost: () => void;
}

export const PostButton = ({
  newPost,
  selectedMedia,
  isSubmitting,
  uploadProgress,
  tabValue,
  hasContent,
  onCreatePost,
}: IPostButtonProps) => {
  const statusText =
    uploadProgress < 25
      ? "Preparing..."
      : uploadProgress < 75
      ? "Uploading media..."
      : uploadProgress < 95
      ? tabValue === 2
        ? "Sharing feedback..."
        : "Creating post..."
      : "Almost done...";

  const postButtonText =
    tabValue === 2
      ? selectedMedia.length > 0
        ? `Share Feedback with ${selectedMedia.length} ${
            selectedMedia.length === 1 ? "file" : "files"
          }`
        : "Share Feedback"
      : selectedMedia.length > 0
      ? `Post with ${selectedMedia.length} ${
          selectedMedia.length === 1 ? "file" : "files"
        }`
      : "Post";

  return (
    <Button
      variant="contained"
      disabled={!hasContent || isSubmitting}
      onClick={onCreatePost}
      startIcon={isSubmitting ? undefined : <Send />}
      sx={{
        borderRadius: 8,
        minWidth: 120,
        fontWeight: 600,
        bgcolor:
          tabValue === 2
            ? selectedMedia.length > 0
              ? "success.main"
              : "success.main"
            : selectedMedia.length > 0
            ? "success.main"
            : "primary.main",
        "&:hover": {
          bgcolor:
            tabValue === 2
              ? selectedMedia.length > 0
                ? "success.dark"
                : "success.dark"
              : selectedMedia.length > 0
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
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={20} color="inherit" />
          <Typography variant="caption" color="inherit">
            {statusText}
          </Typography>
        </Stack>
      ) : (
        postButtonText
      )}
    </Button>
  );
};
