import React from "react";
import { Card, CardContent, Typography, Stack, Skeleton } from "@mui/material";
import { Achievement } from "../../services/dashboardService";

interface AchievementsSectionProps {
  achievements: Achievement[];
  loading: boolean;
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({
  achievements,
  loading,
}) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Recent Achievements
        </Typography>
        <Stack spacing={2}>
          {loading ? (
            <>
              <Skeleton variant="text" height={40} />
              <Skeleton variant="text" height={40} />
              <Skeleton variant="text" height={40} />
            </>
          ) : !achievements || achievements.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Complete lessons to earn achievements!
            </Typography>
          ) : (
            achievements.map((achievement) => (
              <Stack
                key={achievement.id}
                direction="row"
                spacing={2}
                alignItems="center"
              >
                <Typography variant="h4">{achievement.badge}</Typography>
                <Typography variant="body2">{achievement.title}</Typography>
              </Stack>
            ))
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
