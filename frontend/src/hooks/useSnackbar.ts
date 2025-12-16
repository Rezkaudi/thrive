import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import { clearError } from "../store/slices/authSlice";

export type SnackbarSeverity = "success" | "error" | "info" | "warning";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
}

interface UseSnackbarReturn {
  snackbar: SnackbarState;
  showSnackbar: (message: string, severity: SnackbarSeverity) => void;
  closeSnackbar: () => void;
  handleErrorEffect: (error: string | null) => void;
}

export const useSnackbar = (): UseSnackbarReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message: string, severity: SnackbarSeverity) => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleErrorEffect = (error: string | null) => {
    if (error) {
      showSnackbar(error, "error");
      dispatch(clearError());
    }
  };

  return {
    snackbar,
    showSnackbar,
    closeSnackbar,
    handleErrorEffect,
  };
};
