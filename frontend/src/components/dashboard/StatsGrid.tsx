import React from "react";
import { Grid } from "@mui/material";
import { motion } from "framer-motion";
import {
  School,
  Groups,
  CalendarMonth,
  EmojiEvents,
} from "@mui/icons-material";
import { StatCard } from "./StatCard";

interface StatsData {
  totalLessonsCompleted: number;
  totalLessonsAvailable: number;
  totalPoints: number;
  communityPostsCount: number;
  upcomingSessionsCount: number;
}

interface StatsGridProps {
  stats: StatsData;
  loading: boolean;
  onNavigate: (path: string) => void;
}

const COLORS = {
  LESSONS: "#5C633A",
  POINTS: "#A6531C",
  COMMUNITY: "#D4BC8C",
  SESSIONS: "#483C32",
} as const;

const ANIMATION_DELAYS = {
  STAT_CARD: 0.1,
} as const;

const GRID_SIZES = {
  STATS: { xs: 12, sm: 6, md: 3 },
} as const;

export const StatsGrid: React.FC<StatsGridProps> = ({
  stats,
  loading,
  onNavigate,
}) => {
  const statCards = [
    {
      icon: <School />,
      title: "Lessons Completed",
      value: `${stats.totalLessonsCompleted}/${stats.totalLessonsAvailable}`,
      color: COLORS.LESSONS,
      onClick: () => onNavigate("/classroom"),
    },
    {
      icon: <EmojiEvents />,
      title: "Total Points",
      value: stats.totalPoints,
      color: COLORS.POINTS,
    },
    {
      icon: <Groups />,
      title: "Community Posts",
      value: stats.communityPostsCount,
      color: COLORS.COMMUNITY,
      onClick: () => onNavigate("/community"),
    },
    {
      icon: <CalendarMonth />,
      title: "Upcoming Sessions",
      value: stats.upcomingSessionsCount,
      color: COLORS.SESSIONS,
      onClick: () => onNavigate("/calendar"),
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {statCards.map((stat, index) => (
        <Grid size={GRID_SIZES.STATS} key={index}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: index * ANIMATION_DELAYS.STAT_CARD,
            }}
          >
            <StatCard {...stat} loading={loading} />
          </motion.div>
        </Grid>
      ))}
    </Grid>
  );
};
