import {
  CalendarMonth,
  People,
  Repeat,
  Schedule,
  Star,
} from "@mui/icons-material";
import { Grid } from "@mui/material";
import { StatsCard } from "./StatsCard";
import { PaginationInfo } from "../../../store/slices/sessionSlice";

interface IStatsCardsProps {
  pagination: PaginationInfo;
  totalBookings: number;
  recurringCount: number;
  averageFillRate: number;
}

export const StatsCards = ({
  pagination,
  averageFillRate,
  totalBookings,
  recurringCount,
}: IStatsCardsProps) => {
  const statsData = [
    {
      id: 1,
      data: pagination.total,
      icon: <Schedule />,
      label: "Total Sessions",
      description: "Across all pages",
      color: "primary.main",
      valueColor: "primary",
    },
    {
      id: 2,
      data: totalBookings,
      icon: <People />,
      label: "Current Page Bookings",
      description: "From displayed sessions",
      color: "secondary.main",
      valueColor: "secondary",
    },
    {
      id: 3,
      data: `${averageFillRate}%`,
      icon: <Star />,
      label: "Fill Rate",
      description: "Current page average",
      color: "success.main",
      valueColor: "success.main",
    },
    {
      id: 4,
      data: recurringCount,
      icon: <Repeat />,
      label: "Recurring Sessions",
      description: "On current page",
      color: "warning.main",
      valueColor: "warning.main",
    },
    {
      id: 5,
      data: pagination.page,
      icon: <CalendarMonth />,
      label: "Current Page",
      description: `of ${pagination.totalPages} pages`,
      color: "info.main",
      valueColor: "info.main",
    },
  ];

  return (
    <Grid container spacing={3} mb={4}>
      {statsData.map((stat) => (
        <StatsCard
          key={stat.id}
          data={stat.data}
          label={stat.label}
          description={stat.description}
          icon={stat.icon}
          color={stat.color}
          valueColor={stat.valueColor}
        />
      ))}
    </Grid>
  );
};
