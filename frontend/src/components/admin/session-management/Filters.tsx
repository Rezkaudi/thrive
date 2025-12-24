import {
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { AppDispatch } from "../../../store/store";
import {
  clearFilters,
  IFilters,
  setFilter,
  setLimit,
} from "../../../store/slices/sessionSlice";

interface IFiltersProps {
  activeFiltersCount: number;
  dispatch: AppDispatch;
  limit: number;
  filters: IFilters;
}

const filterOptions = [
  {
    label: "Session Type",
    value: "type",
    options: [
      { value: "", label: "All Types" },
      { value: "SPEAKING", label: "Speaking Sessions" },
      { value: "EVENT", label: "Special Events" },
      { value: "STANDARD", label: "Standard Sessions" },
    ],
  },
  {
    label: "Status",
    value: "isActive",
    options: [
      { value: "", label: "All Status" },
      { value: "true", label: "Active" },
      { value: "false", label: "Inactive" },
    ],
  },
  {
    label: "Recurring",
    value: "isRecurring",
    options: [
      { value: "", label: "All Sessions" },
      { value: "true", label: "Recurring Only" },
      { value: "false", label: "One-time Only" },
    ],
  },
];

const limitOptions = [10, 20, 30];

export const Filters = ({
  activeFiltersCount,
  dispatch,
  limit,
  filters,
}: IFiltersProps) => {
  const handleLimitChange = (newLimit: number) => {
    dispatch(setLimit(newLimit));
  };

  const handleFilterChange = (filterName: string, value: string) => {
    dispatch(setFilter({ filterName, value }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Stack spacing={3}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight={600}>
              Filter & Pagination
            </Typography>
            {activeFiltersCount > 0 && (
              <Button size="small" onClick={handleClearFilters}>
                Clear Filters ({activeFiltersCount})
              </Button>
            )}
          </Stack>
          <Grid container spacing={2} alignItems="center">
            {filterOptions.map((filter) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                {" "}
                <FormControl fullWidth size="small">
                  <InputLabel>{filter.label}</InputLabel>
                  <Select
                    value={filters[filter.value as keyof IFilters] ?? ""}
                    label={filter.label}
                    onChange={(e) =>
                      handleFilterChange(filter.value, e.target.value)
                    }
                  >
                    {filter.options.map((option) => (
                      <MenuItem value={option.value} key={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            ))}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Items per page</InputLabel>
                <Select
                  value={limit}
                  label="Items per page"
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                >
                  {limitOptions.map((opt) => (
                    <MenuItem value={opt} key={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  );
};
