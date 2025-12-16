import { CardContent, Grid, Card, Typography } from "@mui/material";
import { ActivityFeed } from "../activity/ActivityFeed";

interface IRecentActivityProps {
  recentActivities: any[];
  activitiesLoading: boolean;
}

export const RecentActivity = ({
  recentActivities,
  activitiesLoading,
}: IRecentActivityProps) => {
  return (
    <Grid size={{ xs: 12, md: 6 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Recent Activity
          </Typography>
          <ActivityFeed
            activities={recentActivities}
            loading={activitiesLoading}
            compact
            maxItems={5}
          />
        </CardContent>
      </Card>
    </Grid>
  );
};
