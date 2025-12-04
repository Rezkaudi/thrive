import { Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { PublicProfile } from "../../types/public-profile.types";
import { rarityColors } from "../../context/rarity";


interface IAchievementCardProps {
  achievement: PublicProfile["publicAchievements"][number];
}

export const AchievementCard = ({achievement}: IAchievementCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          height: "100%",
          position: "relative",
          overflow: "visible",
          background: `linear-gradient(135deg, ${
            rarityColors[achievement.rarity]
          }10 0%, ${rarityColors[achievement.rarity]}05 100%)`,
          border: "1px solid",
          borderColor: `${rarityColors[achievement.rarity]}30`,
        }}
      >
        <Chip
          label={achievement.rarity}
          size="small"
          sx={{
            position: "absolute",
            top: -10,
            right: 10,
            backgroundColor: rarityColors[achievement.rarity],
            color: "white",
            fontWeight: 600,
            fontSize: "0.7rem",
            textTransform: "uppercase",
          }}
        />
        <CardContent>
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Typography variant="h1" sx={{ fontSize: "3rem" }}>
              {achievement.icon}
            </Typography>
            <Typography variant="subtitle1" fontWeight={600}>
              {achievement.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {achievement.description}
            </Typography>
            <Typography variant="caption" color="primary">
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
};
