import { Grid } from "@mui/material";
import { StatsCard } from "./StatsCard";

interface StatsGridProps {
  stats: any[];
  startIndex?: number;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  stats,
  startIndex = 0,
}) => {
  return (
    <Grid container spacing={3} mb={4}>
      {stats.map((stat, index) => (
        <Grid size={{ xs: 6, md: 3 }} key={index}>
          <StatsCard stat={stat} index={startIndex + index} />
        </Grid>
      ))}
    </Grid>
  );
};
