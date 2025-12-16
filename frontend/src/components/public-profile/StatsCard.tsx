import { Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { StatItem } from "../../types/stat-item.types";

interface IStatsCardProps {
  stat: StatItem;
  index: number;
}

export const StatsCard = ({ stat, index }: IStatsCardProps) => {
  return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        style={{ height: "100%" }} // Ensures motion div takes full height of grid
      >
        <Card
          sx={{
            minHeight: "155px",
            height: "100%",
            // Flexbox settings for perfect centering:
            display: "flex", 
            flexDirection: "column",
            justifyContent: "center", // Vertically centers the content
            alignItems: "center",     // Horizontally centers the content
            
            background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`,
            border: `1px solid ${stat.color}30`,
          }}
        >
          <CardContent>
            <Stack spacing={1} alignItems="center" textAlign="center">
              {stat.icon}
              <Typography variant="h4" fontWeight={700} color={stat.color}>
                {stat.value}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {stat.label}
              </Typography>

              {stat.description && (
                <Typography variant="caption" color="text.secondary">
                  {stat.description}
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      </motion.div>
  );
};