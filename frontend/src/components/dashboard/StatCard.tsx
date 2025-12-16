import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  Box,
  Skeleton,
} from "@mui/material";
import { motion } from "framer-motion";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color: string;
  onClick?: () => void;
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  color,
  onClick,
  loading,
}) => (
  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
    <Card
      sx={{
        cursor: onClick ? "pointer" : "default",
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}20`,
        height: "100%",
      }}
      onClick={onClick}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            {loading ? (
              <Skeleton variant="text" width={60} height={40} />
            ) : (
              <Typography variant="h4" fontWeight={700} color={color}>
                {value}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {title}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>{icon}</Avatar>
        </Stack>
      </CardContent>
    </Card>
  </motion.div>
);
