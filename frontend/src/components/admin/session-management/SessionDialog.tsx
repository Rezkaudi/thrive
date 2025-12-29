import { useMemo, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Switch,
  FormControlLabel,
  Checkbox,
  Button,
  CircularProgress,
  Grid,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  Add,
  Edit,
  Event,
  Mic,
  Repeat,
  StarOutlined,
  Timeline,
} from "@mui/icons-material";
import { useForm, Controller, useWatch } from "react-hook-form";

/** TYPES **/
export type SessionType = "SPEAKING" | "EVENT" | "STANDARD";

export interface SessionFormShape {
  id?: string;
  type: SessionType;
  title: string;
  description: string;
  meetingUrl?: string;
  location?: string;
  scheduledAt: string; // ISO string
  duration: number; // minutes
  maxParticipants: number;
  pointsRequired: number;
  isRecurring: boolean;
  recurringWeeks: number;
  updateAllRecurring?: boolean; // for editing parent of a series
  isActive: boolean;
}

export interface EditingSessionMeta {
  id: string;
  isRecurring?: boolean;
  recurringParentId?: string | null;
}

interface ISessionDialogProps {
  open: boolean;
  onClose: () => void;
  editingSession?: EditingSessionMeta | null;
  form: SessionFormShape;
  onChange: (patch: Partial<SessionFormShape>) => void;
  onSubmit: (form: SessionFormShape) => void;
  submitting?: boolean;
}

/** Utils **/
const toDate = (iso?: string): Date | null => {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
};

const TITLE_BY_TYPE: Record<
  SessionType,
  { create: string; edit: string; fieldLabel: string; placeholder: string }
> = {
  SPEAKING: {
    create: "Create New Speaking Session",
    edit: "Edit Speaking Session",
    fieldLabel: "Session Title",
    placeholder: "e.g., Morning Conversation Practice",
  },
  EVENT: {
    create: "Create New Special Event",
    edit: "Edit Special Event",
    fieldLabel: "Event Title",
    placeholder: "e.g., Cultural Exchange Workshop",
  },
  STANDARD: {
    create: "Create New Standard Session",
    edit: "Edit Standard Session",
    fieldLabel: "Standard Title",
    placeholder: "e.g, Standard Learning Session",
  },
};

export const SessionDialog = ({
  open,
  onClose,
  editingSession,
  form,
  onChange,
  onSubmit,
  submitting = false,
}: ISessionDialogProps) => {
  const isEditing = Boolean(editingSession);
  const isEditingSeriesRoot = Boolean(
    editingSession?.isRecurring && !editingSession?.recurringParentId
  );

  const {
    control,
    handleSubmit,
    formState: { isValid },
    reset,
    getValues,
    setValue, // <--- Add setValue here
  } = useForm<SessionFormShape>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: form,
    shouldUnregister: false,
  });

  const prevOpenRef = useRef(open);
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      reset(form, { keepDirty: false, keepTouched: false });
    }
    prevOpenRef.current = open;
  }, [open, reset, form]);

  const prevSessionIdRef = useRef(editingSession?.id ?? "__none__");
  useEffect(() => {
    if (!open) return;
    const currId = editingSession?.id ?? "__none__";
    if (currId !== prevSessionIdRef.current) {
      reset(form, { keepDirty: false, keepTouched: false });
      prevSessionIdRef.current = currId;
    }
  }, [editingSession?.id, open, reset, form]);

  const type = useWatch({ control, name: "type" });
  const isRecurring = useWatch({ control, name: "isRecurring" });
  const recurringWeeks = useWatch({ control, name: "recurringWeeks" });
  const updateAllRecurring = useWatch({ control, name: "updateAllRecurring" });
  const title = useWatch({ control, name: "title" });
  const description = useWatch({ control, name: "description" });
  const duration = useWatch({ control, name: "duration" });
  const maxParticipants = useWatch({ control, name: "maxParticipants" });

  // 🐛 FIX: This useEffect hook explicitly sets the value of the active field
  // when the dialog opens or the type changes.
  useEffect(() => {
    if (open) {
      if (type === "EVENT" && form.location) {
        setValue("location", form.location, { shouldDirty: true });
      } else if (type === "SPEAKING" && form.meetingUrl) {
        setValue("meetingUrl", form.meetingUrl, { shouldDirty: true });
      }
    }
  }, [open, type, form, setValue]);

  const headerMeta = useMemo(() => TITLE_BY_TYPE[type || "SPEAKING"], [type]);
  const Icon =
    type === "SPEAKING" ? Mic : type === "STANDARD" ? StarOutlined : Event;

  const submitIcon = submitting ? undefined : isEditing ? <Edit /> : <Add />;
  const submitLabel = submitting
    ? isEditing
      ? "Updating..."
      : "Creating..."
    : isEditing
    ? isEditingSeriesRoot && updateAllRecurring
      ? "Update Series"
      : "Update Session"
    : isRecurring
    ? `Create ${recurringWeeks} Sessions`
    : "Create Session";

  const titleError = !title?.trim();
  const descriptionError = !description?.trim();
  const durationError = Number(duration) < 15 || Number(duration) > 180;
  const participantsError =
    Number(maxParticipants) < 1 || Number(maxParticipants) > 100;

  const canSubmit =
    isValid &&
    !submitting &&
    !titleError &&
    !descriptionError &&
    !durationError &&
    !participantsError;

  const onLocalSubmit = handleSubmit(() => {
    const all = getValues();
    onChange(all);
    onSubmit(all);
  });

  const asInt = useCallback((v: string, fallback: number) => {
    const n = parseInt(v || "0", 10);
    return Number.isFinite(n) ? n : fallback;
  }, []);

  const syncNow = useCallback(
    (patch: Partial<SessionFormShape>) => {
      onChange(patch);
    },
    [onChange]
  );

  const handleTypeChange = useCallback(
    (val: SessionType) => {
      const patch: Partial<SessionFormShape> = { type: val };

      if (!isEditing) {
        if (val === "STANDARD") {
          patch.duration = 60;
          patch.maxParticipants = 12;
          setValue("duration", 60, { shouldDirty: true });
          setValue("maxParticipants", 12, { shouldDirty: true });
        } else if (val === "SPEAKING") {
          patch.duration = 60;
          patch.maxParticipants = 4;
          setValue("duration", 60, { shouldDirty: true });
          setValue("maxParticipants", 4, { shouldDirty: true });
        }
      }

      syncNow(patch);
    },
    [isEditing, setValue, syncNow]
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth keepMounted>
        <DialogTitle>
          <Stack direction="row" spacing={2} alignItems="center">
            <Icon />
            <Typography variant="h6">
              {isEditing ? headerMeta.edit : headerMeta.create}
            </Typography>
            {editingSession?.isRecurring && (
              <Chip
                icon={<Repeat />}
                label="Recurring"
                size="small"
                color="info"
                variant="outlined"
              />
            )}
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ pt: 2 }}>
            {/* Title */}
            <Controller
              control={control}
              name="title"
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  required
                  label={headerMeta.fieldLabel}
                  placeholder={headerMeta.placeholder}
                  error={titleError}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={(e) => syncNow({ title: e.target.value })}
                  helperText={titleError ? "Title is required" : " "}
                />
              )}
            />

            {/* Description */}
            <Controller
              control={control}
              name="description"
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  required
                  multiline
                  rows={3}
                  label="Description"
                  placeholder={
                    type === "SPEAKING"
                      ? "Describe what participants will practice..."
                      : type === "STANDARD"
                      ? "Describe the standard session content..."
                      : "Describe the special event activities..."
                  }
                  error={descriptionError}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={(e) => syncNow({ description: e.target.value })}
                  helperText={
                    descriptionError ? "Description is required" : " "
                  }
                />
              )}
            />

            {/* Type */}
            <FormControl fullWidth>
              <InputLabel id="session-type">Session Type</InputLabel>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select
                    {...field}
                    labelId="session-type"
                    label="Session Type"
                    value={field.value}
                    onChange={(e) => {
                      const val = e.target.value as SessionType;
                      field.onChange(val);
                      handleTypeChange(val);
                    }}
                    onBlur={() => syncNow({ type: field.value })}
                  >
                    <MenuItem value="SPEAKING">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Mic />
                        <span>Speaking Practice Session</span>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="EVENT">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Event />
                        <span>Special Event</span>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="STANDARD">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <StarOutlined />
                        <span>Standard Event</span>
                      </Stack>
                    </MenuItem>
                  </Select>
                )}
              />
            </FormControl>

            {/* Location / Meeting URL */}
            {type === "SPEAKING" || type === "STANDARD" ? (
              <Controller
                control={control}
                name="meetingUrl"
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Meeting URL"
                    helperText="Google Meet URL will be generated if left empty"
                    placeholder="https://meet.google.com/..."
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={(e) => syncNow({ meetingUrl: e.target.value })}
                  />
                )}
              />
            ) : (
              <Controller
                control={control}
                name="location"
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Event Location"
                    placeholder="e.g., Community Center Room A, or Online"
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={(e) => syncNow({ location: e.target.value })}
                  />
                )}
              />
            )}

            {/* Date & Time */}
            <Controller
              control={control}
              name="scheduledAt"
              rules={{ required: true }}
              render={({ field }) => (
                <DateTimePicker
                  label="Date & Time"
                  value={toDate(field.value)}
                  onChange={(d) => {
                    if (!d) return;
                    const val = d.toISOString();
                    field.onChange(val);
                    syncNow({ scheduledAt: val });
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      helperText: "Select when this session will take place",
                    },
                  }}
                />
              )}
            />

            {/* Numbers */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  control={control}
                  name="duration"
                  rules={{ min: 15, max: 180, required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Duration (minutes)"
                      inputProps={{ min: 15, max: 180, inputMode: "numeric" }}
                      onWheel={(e) => (e.target as HTMLInputElement).blur()}
                      onChange={(e) =>
                        field.onChange(asInt(e.target.value, 60))
                      }
                      onBlur={(e) =>
                        syncNow({
                          duration: asInt(
                            (e.target as HTMLInputElement).value,
                            60
                          ),
                        })
                      }
                      error={durationError}
                      helperText={
                        durationError
                          ? "Must be 15–180 minutes"
                          : "15–180 minutes"
                      }
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  control={control}
                  name="maxParticipants"
                  rules={{ min: 1, max: 100, required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Max Participants"
                      inputProps={{ min: 1, max: 100, inputMode: "numeric" }}
                      onWheel={(e) => (e.target as HTMLInputElement).blur()}
                      onChange={(e) => field.onChange(asInt(e.target.value, 1))}
                      onBlur={(e) =>
                        syncNow({
                          maxParticipants: asInt(
                            (e.target as HTMLInputElement).value,
                            1
                          ),
                        })
                      }
                      error={participantsError}
                      helperText={
                        participantsError
                          ? "Must be 1–100 people"
                          : "1–100 people"
                      }
                    />
                  )}
                />
              </Grid>
            </Grid>

            {/* Points */}
            <Controller
              control={control}
              name="pointsRequired"
              rules={{ min: 0, required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="number"
                  label="Points Required"
                  inputProps={{ min: 0, inputMode: "numeric" }}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  onChange={(e) => field.onChange(asInt(e.target.value, 0))}
                  onBlur={(e) =>
                    syncNow({
                      pointsRequired: asInt(
                        (e.target as HTMLInputElement).value,
                        0
                      ),
                    })
                  }
                  helperText="Set to 0 for free sessions. Premium sessions typically cost 10–50 points."
                />
              )}
            />

            {/* Recurring (create only) */}
            {!isEditing && (
              <>
                <Divider />
                <Controller
                  control={control}
                  name="isRecurring"
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.checked);
                            syncNow({ isRecurring: e.target.checked });
                          }}
                        />
                      }
                      label={
                        <Stack>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Repeat />
                            <Typography variant="body2">
                              Recurring Session
                            </Typography>
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            Create multiple sessions repeating weekly
                          </Typography>
                        </Stack>
                      }
                    />
                  )}
                />

                {isRecurring && (
                  <Controller
                    control={control}
                    name="recurringWeeks"
                    rules={{ min: 2, max: 52 }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="number"
                        label="Number of Weeks"
                        inputProps={{ min: 2, max: 52, inputMode: "numeric" }}
                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        onChange={(e) =>
                          field.onChange(asInt(e.target.value, 4))
                        }
                        onBlur={(e) =>
                          syncNow({
                            recurringWeeks: asInt(
                              (e.target as HTMLInputElement).value,
                              4
                            ),
                          })
                        }
                        helperText={`Will create ${field.value} sessions, one each week starting from the selected date`}
                      />
                    )}
                  />
                )}
              </>
            )}

            {/* Update-all (editing series root) */}
            {isEditingSeriesRoot && (
              <>
                <Divider />
                <Controller
                  control={control}
                  name="updateAllRecurring"
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={Boolean(field.value)}
                          onChange={(e) => {
                            field.onChange(e.target.checked);
                            syncNow({ updateAllRecurring: e.target.checked });
                          }}
                        />
                      }
                      label={
                        <Stack>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Timeline />
                            <Typography variant="body2">
                              Update All in Series
                            </Typography>
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            Apply changes to all sessions in this recurring
                            series
                          </Typography>
                        </Stack>
                      }
                    />
                  )}
                />
              </>
            )}

            {/* Active toggle */}
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value}
                      onChange={(e) => {
                        field.onChange(e.target.checked);
                        syncNow({ isActive: e.target.checked });
                      }}
                    />
                  }
                  label={
                    <Stack>
                      <Typography variant="body2">Active Session</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {field.value
                          ? "Participants can book this session"
                          : "Session is hidden from participants"}
                      </Typography>
                    </Stack>
                  }
                />
              )}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={onLocalSubmit}
            disabled={!canSubmit || submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={16} />
              ) : isEditing ? (
                <Edit />
              ) : (
                <Add />
              )
            }
            sx={{ color: "white" }}
          >
            {submitLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};
