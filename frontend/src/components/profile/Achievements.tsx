import { Alert, Chip, Grid, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { AchievementCard } from "./AchievementCard";
import { rarityColors } from "../../context/rarity";
import { Achievement } from "../../types/achievement.types";

interface IAchievementsProps {
  isMobile?: boolean;
  achievements: Achievement[];
}

export const Achievements = ({
  isMobile,
  achievements,
}: IAchievementsProps) => {
  return (
    <motion.div
      key="achievements"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <Stack spacing={3}>
        <Stack
          direction={isMobile ? "column" : "row"}
          gap={1}
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6" fontWeight={600}>
            Your Achievements
          </Typography>
          <Stack direction="row" spacing={1}>
            {Object.entries(rarityColors).map(([rarity, color]) => (
              <Chip
                key={rarity}
                label={rarity}
                size="small"
                sx={{
                  backgroundColor: color,
                  color: "white",
                  textTransform: "capitalize",
                  fontSize: "0.7rem",
                }}
              />
            ))}
          </Stack>
        </Stack>

        <Grid container spacing={3}>
          {achievements.map((achievement) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={achievement.id}>
              <AchievementCard achievement={achievement} />
            </Grid>
          ))}
        </Grid>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Complete lessons, participate in the community, and practice
            speaking to unlock more achievements!
          </Typography>
        </Alert>
      </Stack>
    </motion.div>
  );
};
