import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { Achievement } from "../../types/achievement.types";
import { rarityColors } from "../../context/rarity";

export const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
  const isUnlocked = !!achievement.unlockedAt;

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
          opacity: isUnlocked ? 1 : 0.7,
          background: isUnlocked
            ? `linear-gradient(135deg, ${
                rarityColors[achievement.rarity || "common"]
              }10 0%, ${rarityColors[achievement.rarity || "common"]}05 100%)`
            : "linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%)",
          border: "1px solid",
          borderColor: isUnlocked
            ? `${rarityColors[achievement.rarity || "common"]}30`
            : "divider",
          filter: isUnlocked ? "none" : "grayscale(100%)",
        }}
      >
        {achievement.rarity && isUnlocked && (
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
        )}
        <CardContent>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Typography variant="h1" sx={{ fontSize: "3rem" }}>
                {achievement.icon}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {achievement.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {achievement.description}
              </Typography>
            </Box>
            {isUnlocked && achievement.unlockedAt && (
              <Typography
                variant="caption"
                color="primary"
                sx={{ textAlign: "center" }}
              >
                Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
};

