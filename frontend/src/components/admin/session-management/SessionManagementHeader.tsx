import { Event, Mic, StarOutlined } from "@mui/icons-material";
import {
  Box,
  Button,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { resetForm } from "../../../store/slices/sessionSlice";
import { AppDispatch } from "../../../store/store";

interface ISessionManagementHeaderProps {
  dispatch: AppDispatch;
  handleFormChange: (field: string, value: any) => void;
  setSessionDialog: (open: boolean) => void;
}

export const SessionManagementHeader = ({
  dispatch,
  handleFormChange,
  setSessionDialog,
}: ISessionManagementHeaderProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  // Helper to generate default date
  const getDefaultScheduledAt = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString();
  };

  return (
    <Stack
      direction={isMobile ? "column" : "row"}
      gap={1}
      justifyContent="space-between"
      alignItems="center"
      mb={4}
    >
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Session Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage speaking sessions and special events with advanced recurring
          options
        </Typography>
      </Box>
      <Stack direction="row" spacing={2}>
        <Button
          variant="outlined"
          startIcon={<Mic />}
          onClick={() => {
            dispatch(resetForm());
            handleFormChange("type", "SPEAKING");
            handleFormChange("duration", 60);
            handleFormChange("maxParticipants", 4);
            // Set default scheduledAt
            handleFormChange("scheduledAt", getDefaultScheduledAt());
            setSessionDialog(true);
          }}
        >
          Speaking Session
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<StarOutlined />}
          onClick={() => {
            dispatch(resetForm());
            handleFormChange("type", "STANDARD");
            handleFormChange("duration", 60);
            handleFormChange("maxParticipants", 12);
            // Set default scheduledAt
            handleFormChange("scheduledAt", getDefaultScheduledAt());
            setSessionDialog(true);
          }}
        >
          Standard Session
        </Button>
        <Button
          variant="contained"
          startIcon={<Event />}
          onClick={() => {
            dispatch(resetForm());
            handleFormChange("type", "EVENT");
            // Set default scheduledAt
            handleFormChange("scheduledAt", getDefaultScheduledAt());
            setSessionDialog(true);
          }}
          sx={{ color: "white" }}
        >
          Special Event
        </Button>
      </Stack>
    </Stack>
  );
};
