import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import {
  fetchPosts,
  loadMorePosts,
  resetPosts,
} from "../store/slices/communitySlice";
import {
  fetchAnnouncements,
  loadMoreAnnouncements,
  resetAnnouncements,
} from "../store/slices/announcementSlice";
import {
  fetchFeedback,
  loadMoreFeedback,
  resetFeedback,
} from "../store/slices/feedbackSlice";
import { TabValue } from "./useCommunityTabs";

export interface CommunityDataState {
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  items: any[];
}

interface UseCommunityDataReturn {
  postsData: CommunityDataState;
  announcementsData: CommunityDataState;
  feedbackData: CommunityDataState;
  loadMore: (tabValue: TabValue) => void;
  resetData: (tabValue: TabValue) => void;
}

export const useCommunityData = (): UseCommunityDataReturn => {
  const dispatch = useDispatch<AppDispatch>();

  // Community state (posts)
  const {
    posts,
    loading: postsLoading,
    loadingMore: postsLoadingMore,
    hasMorePosts,
    error: postsError,
  } = useSelector((state: RootState) => state.community);

  // Announcements state
  const {
    announcements,
    loading: announcementsLoading,
    loadingMore: announcementsLoadingMore,
    hasMoreAnnouncements,
    error: announcementsError,
  } = useSelector((state: RootState) => state.announcements);

  // Feedback state
  const {
    feedback,
    loading: feedbackLoading,
    loadingMore: feedbackLoadingMore,
    hasMoreFeedback,
    error: feedbackError,
  } = useSelector((state: RootState) => state.feedback);

  // Fetch initial data when component mounts
  useEffect(() => {
    dispatch(fetchAnnouncements({ page: 1, limit: 20 }));
    dispatch(fetchPosts({ page: 1, limit: 20 }));
    dispatch(fetchFeedback({ page: 1, limit: 20 }));
  }, [dispatch]);

  const loadMore = useCallback(
    (tabValue: TabValue) => {
      const isLoadingMore =
        tabValue === 0
          ? announcementsLoadingMore
          : tabValue === 1
            ? postsLoadingMore
            : feedbackLoadingMore;

      const hasMore =
        tabValue === 0 ? hasMoreAnnouncements : tabValue === 1 ? hasMorePosts : hasMoreFeedback;

      if (hasMore && !isLoadingMore) {
        if (tabValue === 0) {
          dispatch(loadMoreAnnouncements());
        } else if (tabValue === 1) {
          dispatch(loadMorePosts());
        } else {
          dispatch(loadMoreFeedback());
        }
      }
    },
    [dispatch, announcementsLoadingMore, postsLoadingMore, feedbackLoadingMore, hasMoreAnnouncements, hasMorePosts, hasMoreFeedback]
  );

  const resetData = useCallback(
    (tabValue: TabValue) => {
      if (tabValue === 0) {
        dispatch(resetAnnouncements());
        dispatch(fetchAnnouncements({ page: 1, limit: 20 }));
      } else if (tabValue === 1) {
        dispatch(resetPosts());
        dispatch(fetchPosts({ page: 1, limit: 20 }));
      } else {
        dispatch(resetFeedback());
        dispatch(fetchFeedback({ page: 1, limit: 20 }));
      }
    },
    [dispatch]
  );

  return {
    postsData: {
      loading: postsLoading,
      loadingMore: postsLoadingMore,
      hasMore: hasMorePosts,
      error: postsError,
      items: posts,
    },
    announcementsData: {
      loading: announcementsLoading,
      loadingMore: announcementsLoadingMore,
      hasMore: hasMoreAnnouncements,
      error: announcementsError,
      items: announcements,
    },
    feedbackData: {
      loading: feedbackLoading,
      loadingMore: feedbackLoadingMore,
      hasMore: hasMoreFeedback,
      error: feedbackError,
      items: feedback,
    },
    loadMore,
    resetData,
  };
};
