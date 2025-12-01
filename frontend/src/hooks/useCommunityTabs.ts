import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export type TabValue = 0 | 1 | 2; // 0: announcements, 1: posts, 2: feedback

interface UseCommunityTabsReturn {
  tabValue: TabValue;
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

export const useCommunityTabs = (): UseCommunityTabsReturn => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tabValue, setTabValue] = useState<TabValue>(0);

  // Handle URL parameters on mount and URL changes
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get("tab");

    if (tabParam === "posts") {
      setTabValue(1);
    } else if (tabParam === "announcements") {
      setTabValue(0);
    } else if (tabParam === "feedback") {
      setTabValue(2);
    }
  }, [location.search]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue as TabValue);
    const tabName =
      newValue === 0 ? "announcements" : newValue === 1 ? "posts" : "feedback";
    navigate(`/community?tab=${tabName}`, { replace: true });
  };

  return {
    tabValue,
    handleTabChange,
  };
};
