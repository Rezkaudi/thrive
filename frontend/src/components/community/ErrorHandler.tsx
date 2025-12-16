import React from "react";
import { Alert, Snackbar } from "@mui/material";
import { SnackbarSeverity } from "../../hooks/useSnackbar";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
}

interface ErrorHandlerProps {
  snackbar: SnackbarState;
  onClose: () => void;
  error?: string | null;
}

export const ErrorHandler: React.FC<ErrorHandlerProps> = ({
  snackbar,
  onClose,
  error,
}) => {
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
    >
      <Alert
        onClose={onClose}
        severity={snackbar.severity}
        sx={{ width: "100%" }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
};
