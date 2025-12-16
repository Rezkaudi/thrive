import { Paper, Typography, Grid } from "@mui/material";

interface StatItemProps {
  value: string | number;
  label: string;
  color: "primary" | "success.main" | "warning.main" | "info.main";
}

export const StatItem = ({ value, label, color }: StatItemProps) => (
  <Grid size={6}>
    <Paper sx={{ p: 2, textAlign: "center", height: '100%' }}>
      <Typography variant="h5" fontWeight={600} sx={{ color }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Paper>
  </Grid>
);