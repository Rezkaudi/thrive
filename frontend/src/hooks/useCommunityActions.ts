import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import {
  deletePost,
  editPost,
  toggleLike,
} from "../store/slices/communitySlice";
import {
  toggleAnnouncementLike,
  editAnnouncement,
  deleteAnnouncement,
} from "../store/slices/announcementSlice";
import {
  toggleFeedbackLike,
  editFeedback,
  deleteFeedback,
} from "../store/slices/feedbackSlice";
import { TabValue } from "./useCommunityTabs";

interface UseCommunityActionsReturn {
  handleToggleLike: (itemId: string, tabValue: TabValue) => void;
  handleEditItem: (
    itemId: string,
    newContent: string,
    mediaUrls: string[] | undefined,
    tabValue: TabValue
  ) => Promise<void>;
  handleDeleteItem: (itemId: string, tabValue: TabValue) => Promise<void>;
}

export const useCommunityActions = (): UseCommunityActionsReturn => {
  const dispatch = useDispatch<AppDispatch>();

  const handleToggleLike = (itemId: string, tabValue: TabValue) => {
    if (tabValue === 0) {
      dispatch(toggleAnnouncementLike(itemId));
    } else if (tabValue === 1) {
      dispatch(toggleLike(itemId));
    } else {
      dispatch(toggleFeedbackLike(itemId));
    }
  };

  const handleEditItem = async (
    itemId: string,
    newContent: string,
    mediaUrls: string[] | undefined,
    tabValue: TabValue
  ) => {
    try {
      if (tabValue === 0) {
        await dispatch(
          editAnnouncement({ announcementId: itemId, content: newContent })
        ).unwrap();
      } else if (tabValue === 1) {
        await dispatch(
          editPost({ postId: itemId, content: newContent, mediaUrls })
        ).unwrap();
      } else {
        await dispatch(
          editFeedback({ feedbackId: itemId, content: newContent, mediaUrls })
        ).unwrap();
      }
    } catch (error: any) {
      throw error;
    }
  };

  const handleDeleteItem = async (itemId: string, tabValue: TabValue) => {
    try {
      if (tabValue === 0) {
        await dispatch(deleteAnnouncement(itemId)).unwrap();
      } else if (tabValue === 1) {
        await dispatch(deletePost(itemId)).unwrap();
      } else {
        await dispatch(deleteFeedback(itemId)).unwrap();
      }
    } catch (error: any) {
      throw error;
    }
  };

  return {
    handleToggleLike,
    handleEditItem,
    handleDeleteItem,
  };
};
