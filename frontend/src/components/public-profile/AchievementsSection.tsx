import { Card, CardContent, Divider, Grid, Typography } from "@mui/material";
import { PublicProfile } from "../../services/profileService";
import { AchievementCard } from "./AchievementCard";

interface IAchievementsSectionProps {
  profile: PublicProfile
}

export const AchievementsSection = ({profile}: IAchievementsSectionProps) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Achievements ({profile?.publicAchievements.length})
        </Typography>
        <Divider sx={{ mb: 3 }} />
        {profile?.publicAchievements.length > 0 ? (
          <Grid container spacing={3}>
            {profile?.publicAchievements.map((achievement) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={achievement.id}>
                <AchievementCard achievement={achievement} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            py={4}
          >
            No achievements unlocked yet
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
