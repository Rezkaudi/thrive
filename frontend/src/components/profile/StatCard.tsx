import { Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";

interface IStatsCardProps {
  index: number;
  stat: {
    label: string;
    value: number;
    description: string;
    icon: React.ReactNode;
    color: string;
  };
}

export const StatCard = ({ index, stat }: IStatsCardProps) => {
  return (
    <Grid size={{ xs: 6, md: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Card
          sx={{
            height: "100%",
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
              <Typography variant="caption" color="text.secondary">
                {stat.description}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </motion.div>
    </Grid>
  );
};
