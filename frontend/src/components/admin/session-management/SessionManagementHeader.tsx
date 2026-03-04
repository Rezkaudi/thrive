import { Event, StarOutlined, WorkspacePremium } from "@mui/icons-material";
import {
  Button,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { resetForm } from "../../../store/slices/sessionSlice";
import { AppDispatch } from "../../../store/store";
import AdminNavigationButton from "../AdminNavigationButton";

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

  const getDefaultScheduledAt = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString();
  };

  return (
    <Stack
      direction={isMobile ? "column" : "row"}
      justifyContent="space-between"
      alignItems="center"
      mb={4}
      width="100%"
    >
      <AdminNavigationButton titlePage="Session Management" />

      <Stack direction="row" spacing={2} alignItems="center">
        <Button
          variant="outlined"
          startIcon={<WorkspacePremium />}
          onClick={() => {
            dispatch(resetForm());
            handleFormChange("type", "PREMIUM");
            handleFormChange("duration", 60);
            handleFormChange("maxParticipants", 4);
            handleFormChange("scheduledAt", getDefaultScheduledAt());
            setSessionDialog(true);
          }}
        >
          Premium Session
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