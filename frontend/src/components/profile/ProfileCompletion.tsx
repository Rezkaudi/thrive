import { Box, LinearProgress, Stack, Typography } from "@mui/material";

interface IProfileCompletionProps {
  profileCompletion: () => number;
}

export const ProfileCompletion = ({profileCompletion}: IProfileCompletionProps) => {
  return (
    <Box sx={{ mt: 4 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={1}
          >
            <Typography variant="body2" fontWeight={600}>
              Profile Completion
            </Typography>
            <Typography variant="body2" color="primary" fontWeight={600}>
              {Math.round(profileCompletion())}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={profileCompletion()}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: "action.hover",
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
                background: "linear-gradient(90deg, #5C633A 0%, #D4BC8C 100%)",
              },
            }}
          />
          {profileCompletion() < 100 && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              Complete your profile to unlock all features and earn bonus
              points!
            </Typography>
          )}
        </Box>
  );
};
