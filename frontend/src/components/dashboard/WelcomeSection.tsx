import React from "react";
import { Box, Paper, Stack, Typography, IconButton } from "@mui/material";
import { Refresh } from "@mui/icons-material";
import { motion } from "framer-motion";

interface WelcomeSectionProps {
  userName?: string;
  userEmail?: string;
  onRefresh: () => void;
}

const COLORS = {
  LESSONS: "#5C633A",
  COMMUNITY: "#D4BC8C",
} as const;

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  userName,
  userEmail,
  onRefresh,
}) => {
  const displayName = userName || userEmail?.split("@")[0] || "User";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper
        sx={{
          p: 4,
          mb: 4,
          background: `linear-gradient(135deg, ${COLORS.LESSONS} 0%, ${COLORS.COMMUNITY} 100%)`,
          color: "white",
          borderRadius: 3,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
          }}
        />
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography variant="h4" gutterBottom fontWeight={600}>
              Ready to Thrive, {displayName} ? 👋
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Learn Japanese, Truly belong, Live your purpose.
            </Typography>
          </Box>
          <IconButton
            onClick={onRefresh}
            sx={{ color: "white", bgcolor: "rgba(255,255,255,0.2)" }}
          >
            <Refresh />
          </IconButton>
        </Stack>
      </Paper>
    </motion.div>
  );
};
