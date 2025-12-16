import { Card, CardContent, Grid, Typography } from "@mui/material";
import { PublicProfile } from "../../types/public-profile.types";
import { StatItem } from "./StatItem";

interface IQuickStatsProps {
  profile: PublicProfile;
  overallProgress: number;
}

export const QuickStats = ({ profile, overallProgress }: IQuickStatsProps) => {
  const rareAchievementsCount = profile.publicAchievements.filter((a) =>
    ["rare", "epic", "legendary"].includes(a.rarity)
  ).length;

  const statsConfig = [
    {
      label: "Overall Progress",
      value: `${Math.round(overallProgress)}%`,
      color: "primary" as const,
    },
    {
      label: "Courses Done",
      value: profile.completedCourses,
      color: "success.main" as const,
    },
    {
      label: "Rare+ Achievements",
      value: rareAchievementsCount,
      color: "warning.main" as const,
    },
    {
      label: "Days Active",
      value: profile.joinedDaysAgo,
      color: "info.main" as const,
    },
  ];

  return (
    <Grid size={{ xs: 12, md: 6 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Quick Stats
          </Typography>

          <Grid container spacing={2}>
            {statsConfig.map((stat, index) => (
              <StatItem
                key={index}
                value={stat.value}
                label={stat.label}
                color={stat.color}
              />
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  );
};
