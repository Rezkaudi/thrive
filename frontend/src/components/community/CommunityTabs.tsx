import React from "react";
import { Tabs, Tab } from "@mui/material";
import {
  Campaign,
  People,
  Feedback as FeedbackIcon,
} from "@mui/icons-material";

interface CommunityTabsProps {
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
}

export const CommunityTabs: React.FC<CommunityTabsProps> = ({
  value,
  onChange,
}) => {
  return (
    <Tabs
      value={value}
      onChange={onChange}
      sx={{ mb: 3 }}
      variant="scrollable"
      scrollButtons="auto"
    >
      <Tab label="Announcements" icon={<Campaign />} iconPosition="start" />
      <Tab label="Community Posts" icon={<People />} iconPosition="start" />
      <Tab
        label="Questions, Feedback and Fixes"
        icon={<FeedbackIcon />}
        iconPosition="start"
      />
    </Tabs>
  );
};

export default CommunityTabs;
