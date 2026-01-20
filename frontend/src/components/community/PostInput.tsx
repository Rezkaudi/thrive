// frontend/src/components/community/PostInput.tsx

import React from "react";
import {
  Card,
  CardActions,
  CardContent,
  Divider,
  LinearProgress,
  Box,
  Paper,
  Typography,
  Button,
  Alert,
} from "@mui/material";
import { AttachFile, Lock } from "@mui/icons-material";
import { usePostInput } from "../../hooks/usePostInput";
import PostInputHeader from "./PostInputHeader";
import PostInputActions from "./PostInputActions";
import { useSelector } from "react-redux"; // Import useSelector
import { RootState } from "../../store/store"; // Import RootState
import { useNavigate } from "react-router-dom"; // Import useNavigate

interface IPostInputProps {
  onShowSnackbar?: (
    message: string,
    severity: "success" | "error" | "info" | "warning"
  ) => void;
}

export const PostInput = ({ onShowSnackbar }: IPostInputProps) => {
  const navigate = useNavigate();
  // Check subscription status from Redux
  const subStatus = useSelector((state: RootState) => state.auth.status);
  const isCanceled = subStatus === 'canceled' || subStatus === 'past_due' || subStatus === 'unpaid';

  const {
    newPost,
    setNewPost,
    selectedMedia,
    isSubmitting,
    uploadProgress,
    mediaExpanded,
    setMediaExpanded,
    dragOver,
    tabValue,
    hasContent,
    profilePhoto,
    name,
    handleMediaChange,
    handleClearPost,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleCreatePost,
    handleShowSnackbar,
  } = usePostInput({ onShowSnackbar });

  // --- RESTRICTION VIEW ---
  if (isCanceled) {
    return (
      <Card sx={{ mb: 4, p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
        <Lock sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
        <Typography variant="h6" gutterBottom>
          Community Access Paused
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Your subscription is currently canceled. Renew your plan to create posts, share feedback, and interact with the community.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/subscription')}
        >
          Renew Subscription
        </Button>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        mb: 4,
        position: "relative",
        overflow: "visible",
        border: dragOver ? "2px dashed" : "1px solid",
        borderColor: dragOver
          ? tabValue === 2
            ? "success.main"
            : "primary.main"
          : "divider",
        bgcolor: dragOver
          ? tabValue === 2
            ? "success.50"
            : "primary.50"
          : "background.paper",
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
        <PostInputHeader
          profilePhoto={profilePhoto}
          name={name}
          newPost={newPost}
          setNewPost={setNewPost}
          selectedMedia={selectedMedia}
          onMediaChange={handleMediaChange}
          mediaExpanded={mediaExpanded}
          setMediaExpanded={setMediaExpanded}
          isSubmitting={isSubmitting}
          dragOver={dragOver}
          tabValue={tabValue}
          handleClearPost={handleClearPost}
        />

        {dragOver && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor:
                tabValue === 2
                  ? "rgba(46, 125, 50, 0.1)"
                  : "rgba(25, 118, 210, 0.1)",
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
                bgcolor: tabValue === 2 ? "success.main" : "primary.main",
                color: "white",
                borderRadius: 2,
              }}
            >
              <AttachFile sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h6" fontWeight={600}>
                Drop files to attach
              </Typography>
              <Typography variant="body2">
                They'll be uploaded when you{" "}
                {tabValue === 2 ? "share feedback" : "post"}
              </Typography>
            </Paper>
          </Box>
        )}
      </CardContent>

      <Divider />

      <CardActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
        <PostInputActions
          selectedMedia={selectedMedia}
          setMediaExpanded={setMediaExpanded}
          mediaExpanded={mediaExpanded}
          isSubmitting={isSubmitting}
          hasContent={hasContent}
          handleClearPost={handleClearPost}
          uploadProgress={uploadProgress}
          tabValue={tabValue}
          newPost={newPost}
          onCreatePost={handleCreatePost}
          onShowSnackbar={handleShowSnackbar}
        />
      </CardActions>
    </Card>
  );
};