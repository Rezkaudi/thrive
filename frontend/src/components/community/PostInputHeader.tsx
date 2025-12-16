import React from "react";
import {
  AttachFile,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Collapse,
  Stack,
  TextField,
} from "@mui/material";
import { SelectedMedia, MediaUpload } from "./MediaUpload";

interface PostInputHeaderProps {
  profilePhoto?: string | null;
  name?: string | null;
  newPost: string;
  setNewPost: (value: string) => void;
  selectedMedia: SelectedMedia[];
  onMediaChange: (files: SelectedMedia[]) => void;
  mediaExpanded: boolean;
  setMediaExpanded: (v: boolean) => void;
  isSubmitting: boolean;
  dragOver: boolean;
  tabValue: number;
  handleClearPost: () => void;
}

export const PostInputHeader = ({
  profilePhoto,
  name,
  newPost,
  setNewPost,
  selectedMedia,
  onMediaChange,
  mediaExpanded,
  setMediaExpanded,
  isSubmitting,
  dragOver,
  tabValue,
  handleClearPost,
}: PostInputHeaderProps) => {
  const hasContent = newPost.trim().length > 0 || selectedMedia.length > 0;

  return (
    <>
      <Stack direction="row" spacing={2} mb={2}>
        <Avatar src={profilePhoto || ""} sx={{ width: 48, height: 48 }}>
          {!profilePhoto ? name?.[0] : "U"}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={hasContent ? 3 : 2}
            placeholder={
              dragOver
                ? "Drop files here or type your message..."
                : tabValue === 2
                ? "Share your feedback, suggestions, or experiences with the app..."
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
                bgcolor: dragOver
                  ? tabValue === 2
                    ? "success.50"
                    : "primary.50"
                  : "background.paper",
                transition: "all 0.3s ease",
              },
            }}
          />

          {selectedMedia.length > 0 && !mediaExpanded && (
            <Box sx={{ mt: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AttachFile />}
                endIcon={mediaExpanded ? <ExpandLess /> : <ExpandMore />}
                onClick={() => setMediaExpanded(!mediaExpanded)}
                sx={{
                  borderRadius: 6,
                  bgcolor: tabValue === 2 ? "success.50" : "success.50",
                  borderColor: tabValue === 2 ? "success.main" : "success.main",
                  color: tabValue === 2 ? "success.main" : "success.main",
                  "&:hover": {
                    bgcolor: tabValue === 2 ? "success.100" : "success.100",
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

      <Collapse in={mediaExpanded}>
        <Box sx={{ mb: 2 }}>
          <MediaUpload
            onMediaChange={onMediaChange}
            selectedMedia={selectedMedia}
            maxFiles={5}
            disabled={isSubmitting}
            showPreview={true}
            removeButtonDisabled={isSubmitting}
          />
        </Box>
      </Collapse>
    </>
  );
};

export default PostInputHeader;
