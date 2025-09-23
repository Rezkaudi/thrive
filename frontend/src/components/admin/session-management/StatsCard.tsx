import {
  Avatar,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";

interface IStatsCardProps {
  data: string | number;
  label: string;
  description: string;
  icon: React.ReactNode;
  color?: string;
  valueColor?: string;
}

export const StatsCard = ({
  data,
  label,
  description,
  icon,
  color = "primary.main",
  valueColor = "primary",
}: IStatsCardProps) => {
  return (
    <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
      <Card sx={{ height: "100%" }}>
        <CardContent>
          <Stack spacing={1}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h4" fontWeight={700} color={valueColor}>
                {data}
              </Typography>
              <Avatar sx={{ bgcolor: color, width: 40, height: 40 }}>
                {icon}
              </Avatar>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {description}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );
};
