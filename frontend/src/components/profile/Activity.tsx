import { Box, Pagination, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { ActivityFeed } from "../activity/ActivityFeed";
import { RecentActivity } from "../../services/dashboardService";

interface IActivityProps {
  userActivities: RecentActivity[];
  activityLoading: boolean;
  activityPage: number;
  setActivityPage: (page: number) => void;
  pagination: {
    total: number;
    page: number;
    totalPages: number;
  };
}

export const Activity = ({
  userActivities,
  activityLoading,
  pagination,
  activityPage,
  setActivityPage
}: IActivityProps) => {
  return (
    <motion.div
      key="activity"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Recent Activity
      </Typography>

      <ActivityFeed
        activities={userActivities}
        loading={activityLoading}
        showUser={false}
      />

      {pagination.totalPages > 1 && (
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
          <Pagination
            count={pagination.totalPages}
            page={activityPage}
            onChange={(_, page) => setActivityPage(page)}
            color="primary"
          />
        </Box>
      )}
    </motion.div>
  );
};
