import { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { RootState, AppDispatch } from "../store/store";
import { createPost } from "../store/slices/communitySlice";
import { createFeedback } from "../store/slices/feedbackSlice";
import { communityService } from "../services/communityService";
import { feedbackService } from "../services/feedbackService";
import { SelectedMedia } from "../components/community/MediaUpload";

interface UsePostInputOptions {
  onShowSnackbar?: (
    message: string,
    severity: "success" | "error" | "info" | "warning"
  ) => void;
}

export const usePostInput = ({ onShowSnackbar }: UsePostInputOptions = {}) => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();

  const profilePhoto = useSelector(
    (state: RootState) => state.dashboard.data?.user.profilePhoto
  );
  const name = useSelector(
    (state: RootState) => state.dashboard.data?.user.name
  );

  // Local UI state
  const [newPost, setNewPost] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaExpanded, setMediaExpanded] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [tabValue, setTabValue] = useState<number>(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    return tab === "posts" ? 1 : tab === "feedback" ? 2 : 0;
  });

  // Sync tab value with URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    setTabValue(tab === "posts" ? 1 : tab === "feedback" ? 2 : 0);
  }, [location.search]);

  // Snackbar handler with fallback
  const handleShowSnackbar = useCallback(
    (
      message: string,
      severity: "success" | "error" | "info" | "warning" = "info"
    ) => {
      if (onShowSnackbar) {
        onShowSnackbar(message, severity);
      } else {
        // eslint-disable-next-line no-console
        console.log(`${severity.toUpperCase()}: ${message}`);
      }
    },
    [onShowSnackbar]
  );

  // Media handling
  const handleMediaChange = useCallback((mediaFiles: SelectedMedia[]) => {
    setSelectedMedia(mediaFiles);
  }, []);

  const revokeBlobUrls = useCallback((media: SelectedMedia[]) => {
    media.forEach((item) => {
      if (item.preview && item.preview.startsWith("blob:")) {
        URL.revokeObjectURL(item.preview);
      }
    });
  }, []);

  const handleClearPost = useCallback(() => {
    revokeBlobUrls(selectedMedia);
    setNewPost("");
    setSelectedMedia([]);
    setMediaExpanded(false);
  }, [selectedMedia, revokeBlobUrls]);

  // Drag and drop handlers
  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragOver(false);

      if (isSubmitting) return;

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
      if (!isSubmitting) {
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

  const hasContent =
    newPost.trim().length > 0 || selectedMedia.length > 0;

  // Main post/feedback creation handler
  const handleCreatePost = useCallback(async () => {
    if (!newPost.trim() && selectedMedia.length === 0) return;

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      let mediaUrls: string[] = [];

      // Upload media files if any are selected
      if (selectedMedia.length > 0) {
        setUploadProgress(25);

        const files = selectedMedia.map((media) => media.file);
        // Use appropriate service based on current tab
        const uploadResponse =
          tabValue === 2
            ? await feedbackService.uploadMedia(files)
            : await communityService.uploadMedia(files);

        setUploadProgress(75);
        mediaUrls = uploadResponse.files.map((file) => file.url);
      }

      // Create the post or feedback with uploaded media URLs
      setUploadProgress(90);
      if (tabValue === 2) {
        // Create feedback
        await dispatch(
          createFeedback({
            content: newPost || " ",
            mediaUrls,
          })
        ).unwrap();
      } else {
        // Create post (tabValue === 1)
        await dispatch(
          createPost({
            content: newPost || " ",
            mediaUrls,
          })
        ).unwrap();
      }

      // Clean up
      revokeBlobUrls(selectedMedia);
      setNewPost("");
      setSelectedMedia([]);
      setMediaExpanded(false);
      setUploadProgress(100);

      const itemType = tabValue === 2 ? "Feedback" : "Post";
      handleShowSnackbar(`${itemType} created successfully!`, "success");
    } catch (error) {
      const itemType = tabValue === 2 ? "feedback" : "post";
      // eslint-disable-next-line no-console
      console.error(`Failed to create ${itemType}:`, error);
      handleShowSnackbar(`Failed to create ${itemType}`, "error");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [
    newPost,
    selectedMedia,
    tabValue,
    dispatch,
    handleShowSnackbar,
    revokeBlobUrls,
  ]);

  return {
    // State
    newPost,
    setNewPost,
    selectedMedia,
    setSelectedMedia,
    isSubmitting,
    uploadProgress,
    mediaExpanded,
    setMediaExpanded,
    dragOver,
    setDragOver,
    tabValue,
    hasContent,
    profilePhoto,
    name,
    // Handlers
    handleMediaChange,
    handleClearPost,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleCreatePost,
    handleShowSnackbar,
  };
};
