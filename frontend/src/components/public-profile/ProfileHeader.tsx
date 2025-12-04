import {
  CalendarMonth,
  EmojiEvents,
  Language,
  WorkspacePremium,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { PublicProfile } from "../../services/profileService";

interface IProfileHeaderProps {
  profile: PublicProfile;
  overallProgress: number;
}

export const ProfileHeader = ({
  profile,
  overallProgress,
}: IProfileHeaderProps) => {
  return (
    <Card sx={{ mb: 4, overflow: "visible" }}>
      <CardContent sx={{ p: { xs: 2, md: 4 } }}>
        <Grid container spacing={3} alignItems="flex-start">
          <Grid
            size={{ xs: 12, md: 3 }}
            sx={{ textAlign: { xs: "center", md: "left" } }}
          >
            <Avatar
              src={profile.profilePhoto}
              sx={{
                width: { xs: 120, md: 150 },
                height: { xs: 120, md: 150 },
                mx: "auto",
                border: "4px solid white",
                boxShadow: 3,
              }}
            >
              {profile.name?.[0] || "U"}
            </Avatar>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={2}>
              <Box>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={2}
                  flexWrap="wrap"
                >
                  <Typography variant="h4" fontWeight={700}>
                    {profile.name}
                  </Typography>
                  <Chip
                    icon={<Language />}
                    label={`JLPT ${profile.languageLevel || "N5"}`}
                    color="primary"
                  />
                </Stack>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {profile.bio || "Learning Japanese with passion! 🌸"}
                </Typography>
              </Box>
              <Stack direction="row" gap={2} flexWrap="wrap">
                <Chip
                  icon={<CalendarMonth />}
                  label={`Learning for ${profile.joinedDaysAgo} days`}
                />
                <Chip
                  icon={<WorkspacePremium />}
                  label={`Level ${profile.level}`}
                />
                <Chip
                  icon={<EmojiEvents />}
                  label={`${profile.publicAchievements.length} achievements`}
                />
              </Stack>
            </Stack>
          </Grid>
        </Grid>

        {/* Overall Progress Bar */}
        <Box sx={{ mt: 4 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={1}
          >
            <Typography variant="body2" fontWeight={600}>
              Overall Learning Progress
            </Typography>
            <Typography variant="body2" color="primary" fontWeight={600}>
              {Math.round(overallProgress)}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={overallProgress}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: "action.hover",
              "& .MuiLinearProgress-bar": {
                borderRadius: 5,
                background:
                  "linear-gradient(90deg, #5C633A 0%, #D4BC8C 50%, #A6531C 100%)",
              },
            }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            {profile?.totalLessonsCompleted} of {profile.totalLessonsAvailable}{" "}
            lessons completed
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
