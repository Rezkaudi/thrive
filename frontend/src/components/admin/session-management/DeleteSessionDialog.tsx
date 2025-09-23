import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import { Delete, DeleteSweep, Upgrade, Warning } from "@mui/icons-material";

// TYPES
export type DeleteOption = {
  value: string;
  label: string;
  description?: string;
  severity?: "low" | "medium" | "high" | string;
  recommended?: boolean;
};

export type SeriesInfo = {
  totalSessions: number;
  childrenCount: number;
  nextInLine?: { title: string; scheduledAt: string } | null;
} | null;

interface IDeleteSessionDialogProps {
  open: boolean;
  sessionTitle?: string;
  isRecurring?: boolean;
  options: DeleteOption[];
  loadingOptions?: boolean;
  confirming?: boolean; // deleting spinner
  seriesInfo?: SeriesInfo;
  onClose: () => void;
  onConfirm: (selectedOption: string) => void; // <-- pass selected option
}

export const DeleteSessionDialog = ({
  open,
  sessionTitle,
  isRecurring,
  options,
  loadingOptions = false,
  confirming = false,
  seriesInfo,
  onClose,
  onConfirm,
}: IDeleteSessionDialogProps) => {
  const [selected, setSelected] = useState("");

  // Reset selection when dialog opens or options change
  useEffect(() => {
    if (!open) return;
    // Prefer the recommended option if one exists; otherwise first item
    const recommended = options.find((o) => o.recommended)?.value;
    setSelected(recommended || (options[0]?.value ?? ""));
  }, [open, options]);

  const renderOptionIcon = (value: string) => {
    if (value === "promote") return <Upgrade />;
    if (value === "deleteAll") return <DeleteSweep />;
    return <Delete />; // "single" | "child" | others
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "success";
      case "medium":
        return "warning";
      case "high":
        return "error";
      default:
        return "default";
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={2} alignItems="center">
          <Warning color="warning" />
          <Typography variant="h6">
            Delete Session{sessionTitle ? `: ${sessionTitle}` : ""}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ pt: 2 }}>
          {isRecurring && (
            <Alert severity="info">
              <Typography variant="body2">
                This is a recurring session. Choose what you want to delete.
              </Typography>
            </Alert>
          )}

          {loadingOptions ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <RadioGroup
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {options.map((option) => (
                <Card
                  key={option.value}
                  variant="outlined"
                  sx={{
                    mb: 1,
                    border: selected === option.value ? 2 : 1,
                    borderColor:
                      selected === option.value ? "primary.main" : "grey.300",
                  }}
                >
                  <CardContent sx={{ py: 2 }}>
                    <FormControlLabel
                      value={option.value}
                      control={<Radio />}
                      label={
                        <Stack spacing={1} sx={{ ml: 1 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {renderOptionIcon(option.value)}
                            <Typography variant="body1" fontWeight={600}>
                              {option.label}
                            </Typography>
                            {option.severity && (
                              <Chip
                                label={option.severity.toUpperCase()}
                                size="small"
                                color={getSeverityColor(option.severity) as any}
                                sx={{ color: "white" }}
                              />
                            )}
                            {option.recommended && (
                              <Chip
                                label="RECOMMENDED"
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            )}
                          </Stack>
                          {option.description && (
                            <Typography variant="body2" color="text.secondary">
                              {option.description}
                            </Typography>
                          )}
                        </Stack>
                      }
                      sx={{ alignItems: "flex-start", m: 0 }}
                    />
                  </CardContent>
                </Card>
              ))}
            </RadioGroup>
          )}

          {seriesInfo && (
            <Card variant="outlined" sx={{ bgcolor: "grey.50" }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Series Information
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Total Sessions in Series"
                      secondary={seriesInfo.totalSessions}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Child Sessions"
                      secondary={seriesInfo.childrenCount}
                    />
                  </ListItem>
                  {seriesInfo.nextInLine && (
                    <ListItem>
                      <ListItemText
                        primary="Next Session to be Promoted"
                        secondary={`"${
                          seriesInfo.nextInLine.title
                        }" on ${formatDateTime(
                          seriesInfo.nextInLine.scheduledAt
                        )}`}
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={confirming}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => selected && onConfirm(selected)} // <-- send selection up
          disabled={!selected || confirming}
          sx={{ color: "white" }}
          startIcon={confirming ? <CircularProgress size={16} /> : undefined}
        >
          {confirming ? "Deleting..." : "Confirm Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
