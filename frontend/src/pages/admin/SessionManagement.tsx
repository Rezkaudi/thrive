import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  Alert,
  Snackbar,
  Pagination,
  CircularProgress,
} from "@mui/material";
import {
  Add,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  fetchSessions,
  createSession,
  updateSession,
  deleteSession,
  fetchDeleteOptions,
  setPage,
  clearError,
  resetForm,
  updateForm,
  setFormFromSession,
  clearDeleteOptions,
  Session,
} from "../../store/slices/sessionSlice";
import { AppDispatch, RootState } from "../../store/store";
import {
  DeleteSessionDialog,
  Filters,
  SessionDialog,
  SessionManagementHeader,
  SessionsTable,
  StatsCards,
} from "../../components/admin/session-management";

export const SessionManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const {
    sessions,
    pagination,
    filters,
    loading,
    error,
    creating,
    updating,
    deleting,
    deleteOptions,
    deleteOptionsLoading,
    recurringDetails,
    sessionForm,
  } = useSelector((state: RootState) => state.session);

  // Local state
  const [sessionDialog, setSessionDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning" | "info",
  });

  // Fetch sessions when component mounts or dependencies change
  useEffect(() => {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...(filters.type && { type: filters.type }),
      ...(filters.isActive !== "" && { isActive: filters.isActive }),
      ...(filters.isRecurring !== "" && { isRecurring: filters.isRecurring }),
    };

    dispatch(fetchSessions(params));
  }, [dispatch, pagination.page, pagination.limit, filters]);

  // Handle form changes
  const handleFormChange = (field: string, value: any) => {
    dispatch(updateForm({ [field]: value }));
  };

  // Handle save session
  const handleSaveSession = async () => {
    // 1. Validate required fields
    if (!sessionForm.title || !sessionForm.description) {
      setSnackbar({
        open: true,
        message: "Title and Description are required.",
        severity: "error",
      });
      return;
    }

    // 2. Validate duration constraints
    if (sessionForm.duration < 15 || sessionForm.duration > 180) {
      setSnackbar({
        open: true,
        message: "Session duration must be between 15 and 180 minutes.",
        severity: "error",
      });
      return;
    }

    try {
      const payload = {
        ...sessionForm,
        scheduledAt: sessionForm.scheduledAt,
      };

      if (editingSession) {
        await dispatch(
          updateSession({
            sessionId: editingSession.id,
            sessionData: payload,
          })
        ).unwrap();

        setSnackbar({
          open: true,
          message:
            editingSession.isRecurring && sessionForm.updateAllRecurring
              ? "All recurring sessions updated successfully!"
              : "Session updated successfully!",
          severity: "success",
        });
      } else {
        const result = await dispatch(createSession(payload)).unwrap();

        if (result.sessions && result.sessions.length > 1) {
          setSnackbar({
            open: true,
            message: `Created ${result.sessions.length} recurring sessions successfully!`,
            severity: "success",
          });
        } else {
          setSnackbar({
            open: true,
            message: "Session created successfully!",
            severity: "success",
          });
        }
      }

      setSessionDialog(false);
      setEditingSession(null);
      dispatch(resetForm());

      // Refresh sessions list
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.type && { type: filters.type }),
        ...(filters.isActive !== "" && { isActive: filters.isActive }),
        ...(filters.isRecurring !== "" && { isRecurring: filters.isRecurring }),
      };
      dispatch(fetchSessions(params));
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error || "Failed to save session",
        severity: "error",
      });
    }
  };

  // Handle delete session (open dialog and load options)
  const handleDeleteSession = async (session: Session) => {
    try {
      setSessionToDelete(session);

      // Fetch delete options
      await dispatch(fetchDeleteOptions(session.id)).unwrap();
      setDeleteDialog(true);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error || "Failed to load delete options",
        severity: "error",
      });
    }
  };

  // Execute delete with the selected option coming from the dialog
  const executeDelete = async (selectedOption: string) => {
    if (!sessionToDelete || !selectedOption) return;

    try {
      const result = await dispatch(
        deleteSession({
          sessionId: sessionToDelete.id,
          deleteOption: selectedOption,
        })
      ).unwrap();

      let message = "Session deleted successfully";
      if (result.deletedParentAndPromoted) {
        message = `Parent deleted and next session promoted to parent`;
      } else if (result.deletedRecurringSeries) {
        message = `Entire series deleted (${result.deletedCount} sessions)`;
      } else if (result.deletedFromSeries) {
        message = "Session removed from series";
      }

      setSnackbar({
        open: true,
        message,
        severity: "success",
      });

      setDeleteDialog(false);
      setSessionToDelete(null);
      dispatch(clearDeleteOptions());

      // Refresh sessions list
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.type && { type: filters.type }),
        ...(filters.isActive !== "" && { isActive: filters.isActive }),
        ...(filters.isRecurring !== "" && { isRecurring: filters.isRecurring }),
      };
      dispatch(fetchSessions(params));
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error || "Failed to delete session",
        severity: "error",
      });
    }
  };

  // Handle pagination
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    dispatch(setPage(newPage));
  };

  // Calculate stats
  const totalBookings = sessions.reduce(
    (sum, s) => sum + s.currentParticipants,
    0
  );
  const averageFillRate =
    sessions.length > 0
      ? Math.round(
          sessions.reduce(
            (sum, s) => sum + (s.currentParticipants / s.maxParticipants) * 100,
            0
          ) / sessions.length
        )
      : 0;
  const recurringCount = sessions.filter((s) => s.isRecurring).length;
  const activeFiltersCount = Object.values(filters).filter(
    (f) => f !== ""
  ).length;

  if (loading && sessions.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
          }}
        >
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading sessions...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <SessionManagementHeader
          dispatch={dispatch}
          handleFormChange={handleFormChange}
          setSessionDialog={setSessionDialog}
        />

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            onClose={() => dispatch(clearError())}
          >
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <StatsCards
          averageFillRate={averageFillRate}
          pagination={pagination}
          recurringCount={recurringCount}
          totalBookings={totalBookings}
        />

        {/* Filters */}
        <Filters
          limit={pagination.limit}
          activeFiltersCount={activeFiltersCount}
          dispatch={dispatch}
          filters={filters}
        />

        {/* Sessions Table */}
        <Card>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography variant="h6" fontWeight={600}>
                Sessions ({pagination.total} total)
              </Typography>
              <Pagination
                count={pagination.totalPages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Stack>

            {sessions.length === 0 ? (
              <Alert severity="info" sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="h6" gutterBottom>
                  No sessions found
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {activeFiltersCount > 0
                    ? "Try adjusting your filters or create a new session."
                    : "Create your first session to get started!"}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setSessionDialog(true)}
                  sx={{ color: "white" }}
                >
                  Create Session
                </Button>
              </Alert>
            ) : (
              <>
                <SessionsTable
                  sessions={sessions}
                  updating={updating}
                  deleting={deleting}
                  dispatch={dispatch}
                  setSessionDialog={setSessionDialog}
                  setEditingSession={setEditingSession}
                  setFormFromSession={(s) => dispatch(setFormFromSession(s))}
                  onDelete={(s) => handleDeleteSession(s)}
                />

                {/* Bottom Pagination */}
                <Stack direction="row" justifyContent="center" mt={3}>
                  <Pagination
                    count={pagination.totalPages}
                    page={pagination.page}
                    onChange={handlePageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                    size="large"
                  />
                </Stack>
              </>
            )}
          </CardContent>
        </Card>

        {/* Delete Dialog */}
        <DeleteSessionDialog
          open={deleteDialog}
          onClose={() => {
            setDeleteDialog(false);
            setSessionToDelete(null);
            dispatch(clearDeleteOptions());
          }}
          sessionTitle={sessionToDelete?.title}
          isRecurring={!!sessionToDelete?.isRecurring}
          options={deleteOptions}
          loadingOptions={deleteOptionsLoading}
          confirming={deleting}
          seriesInfo={recurringDetails?.recurringDetails}
          onConfirm={(opt) => executeDelete(opt)} // <-- pass selected option
        />

        {/* Session Create/Edit Dialog */}
        <SessionDialog
          open={sessionDialog}
          onClose={() => {
            setSessionDialog(false);
            setEditingSession(null);
            dispatch(resetForm());
          }}
          editingSession={
            editingSession
              ? {
                  id: editingSession.id,
                  isRecurring: editingSession.isRecurring,
                  recurringParentId: editingSession.recurringParentId,
                }
              : null
          }
          form={sessionForm}
          onChange={(patch) => dispatch(updateForm(patch))}
          submitting={creating || updating}
          onSubmit={handleSaveSession}
        />

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
};
