import React, { useEffect, useState } from "react";
import { Container, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { PostInput } from "../components/community/PostInput";
import { CommunityTabs } from "../components/community/CommunityTabs";
import { PostsTab } from "../components/community/PostsTab";
import { AnnouncementsTab } from "../components/community/AnnouncementsTab";
import { FeedbackTab } from "../components/community/FeedbackTab";
import { ErrorHandler } from "../components/community/ErrorHandler";
import { useCommunityTabs } from "../hooks/useCommunityTabs";
import { useCommunityData } from "../hooks/useCommunityData";
import { useCommunityActions } from "../hooks/useCommunityActions";
import { useSnackbar } from "../hooks/useSnackbar";

export const CommunityPage: React.FC = () => {
  // Custom hooks
  const { tabValue, handleTabChange } = useCommunityTabs();
  const { postsData, announcementsData, feedbackData, loadMore, resetData } =
    useCommunityData();
  const { handleToggleLike, handleEditItem, handleDeleteItem } =
    useCommunityActions();
  const { snackbar, showSnackbar, closeSnackbar, handleErrorEffect } =
    useSnackbar();

  // Get current user info
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
  const userRole = useSelector((state: RootState) => state.auth.user?.role);

  // Highlighted item state for URL sharing
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(
    null
  );

  // Determine current state based on active tab
  const currentData =
    tabValue === 0
      ? announcementsData
      : tabValue === 1
      ? postsData
      : feedbackData;
  const { loading, loadingMore, hasMore, error, items } = currentData;

  // Handle infinite scroll
  const handleLoadMore = () => {
    loadMore(tabValue);
  };

  // Reset data when changing tabs
  useEffect(() => {
    resetData(tabValue);
  }, [tabValue, resetData]);

  // Handle URL highlight parameter for shared items
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const highlightParam = urlParams.get("highlight");

    if (highlightParam) {
      setHighlightedItemId(highlightParam);

      const timer = setTimeout(() => {
        const itemElement =
          document.getElementById(`post-${highlightParam}`) ||
          document.getElementById(`announcement-${highlightParam}`) ||
          document.getElementById(`feedback-${highlightParam}`);
        if (itemElement) {
          itemElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          setTimeout(() => {
            setHighlightedItemId(null);
            const newParams = new URLSearchParams(window.location.search);
            newParams.delete("highlight");
            const newUrl = newParams.toString()
              ? `${window.location.pathname}?${newParams.toString()}`
              : window.location.pathname;
            window.history.replaceState({}, "", newUrl);
          }, 3000);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [items]);

  // Handle errors with snackbar
  useEffect(() => {
    handleErrorEffect(error);
  }, [error, handleErrorEffect]);

  // Handle edit item with snackbar feedback
  const handleEdit = async (
    itemId: string,
    newContent: string,
    mediaUrls?: string[]
  ) => {
    try {
      await handleEditItem(itemId, newContent, mediaUrls, tabValue);
      const itemType =
        tabValue === 0 ? "Announcement" : tabValue === 1 ? "Post" : "Feedback";
      showSnackbar(`${itemType} updated successfully!`, "success");
    } catch (error: any) {
      const itemType =
        tabValue === 0 ? "announcement" : tabValue === 1 ? "post" : "feedback";
      showSnackbar(error || `Failed to edit ${itemType}`, "error");
    }
  };

  // Handle delete item with snackbar feedback
  const handleDelete = async (itemId: string) => {
    try {
      await handleDeleteItem(itemId, tabValue);
      const itemType =
        tabValue === 0 ? "Announcement" : tabValue === 1 ? "Post" : "Feedback";
      showSnackbar(`${itemType} deleted successfully!`, "success");
    } catch (error: any) {
      const itemType =
        tabValue === 0 ? "announcement" : tabValue === 1 ? "post" : "feedback";
      showSnackbar(error || `Failed to delete ${itemType}`, "error");
    }
  };

  // Handle report item
  const handleReport = async (itemId: string, reason: string) => {
    try {
      const itemType =
        tabValue === 0 ? "Announcement" : tabValue === 1 ? "Post" : "Feedback";
      showSnackbar(`${itemType} reported successfully!`, "info");
    } catch (error) {
      const itemType =
        tabValue === 0 ? "announcement" : tabValue === 1 ? "post" : "feedback";
      console.error(`Failed to report ${itemType}:`, error);
      showSnackbar(`Failed to report ${itemType}`, "error");
    }
  };

  return (
    <Container
      maxWidth="md"
      sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}
    >
      <Typography variant="h3" gutterBottom fontWeight={700}>
        Community
      </Typography>

      {/* Error Alert */}
      <ErrorHandler snackbar={snackbar} onClose={closeSnackbar} error={error} />

      {/* Create Post Card (shows for posts and feedback tabs) */}
      {(tabValue === 1 || tabValue === 2) && (
        <PostInput onShowSnackbar={showSnackbar} />
      )}

      {/* Tabs */}
      <CommunityTabs value={tabValue} onChange={handleTabChange} />

      {/* Render appropriate tab content */}
      {tabValue === 0 && (
        <AnnouncementsTab
          announcements={items}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          currentUserId={currentUserId}
          userRole={userRole}
          highlightedItemId={highlightedItemId}
          onLoadMore={handleLoadMore}
          onToggleLike={(itemId) => handleToggleLike(itemId, tabValue)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReport={handleReport}
          onShowSnackbar={showSnackbar}
        />
      )}

      {tabValue === 1 && (
        <PostsTab
          posts={items}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          currentUserId={currentUserId}
          highlightedItemId={highlightedItemId}
          onLoadMore={handleLoadMore}
          onToggleLike={(itemId) => handleToggleLike(itemId, tabValue)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReport={handleReport}
          onShowSnackbar={showSnackbar}
        />
      )}

      {tabValue === 2 && (
        <FeedbackTab
          feedback={items}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          currentUserId={currentUserId}
          highlightedItemId={highlightedItemId}
          onLoadMore={handleLoadMore}
          onToggleLike={(itemId) => handleToggleLike(itemId, tabValue)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReport={handleReport}
          onShowSnackbar={showSnackbar}
        />
      )}

      {/* Snackbar for feedback */}
      <ErrorHandler snackbar={snackbar} onClose={closeSnackbar} />
    </Container>
  );
};
