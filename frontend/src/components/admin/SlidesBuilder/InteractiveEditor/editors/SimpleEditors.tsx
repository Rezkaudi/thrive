// frontend/src/components/admin/SlidesBuilder/InteractiveEditor/editors/SimpleEditors.tsx
import React, { memo, useCallback, useRef } from "react";
import {
  Stack,
  TextField,
  Grid,
  Paper,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { VolumeUp, CloudUpload, PlayArrow } from "@mui/icons-material";
import {
  MatchingItem,
  SortingItem,
  TimelineItem,
} from "../../../../../types/interactive-items.types";

// Enhanced Matching Editor with Audio Support
interface MatchingEditorProps {
  item: MatchingItem;
  onUpdate: (updates: Partial<MatchingItem>) => void;
}

export const MatchingEditor: React.FC<MatchingEditorProps> = memo(
  ({ item, onUpdate }) => {
    const leftRef = useRef(item.left || "");
    const rightRef = useRef(item.right || "");
    const audioUrlRef = useRef(item.audioUrl || "");

    const handleLeftBlur = useCallback(() => {
      if (leftRef.current !== (item.left || "")) {
        onUpdate({ left: leftRef.current });
      }
    }, [item.left, onUpdate]);

    const handleRightBlur = useCallback(() => {
      if (rightRef.current !== (item.right || "")) {
        onUpdate({ right: rightRef.current });
      }
    }, [item.right, onUpdate]);

    const handleAudioUrlBlur = useCallback(() => {
      if (audioUrlRef.current !== (item.audioUrl || "")) {
        onUpdate({ audioUrl: audioUrlRef.current });
      }
    }, [item.audioUrl, onUpdate]);

    const playAudio = useCallback((url: string) => {
      if (url) {
        const audio = new Audio(url);
        audio.play().catch((err) => console.error("Error playing audio:", err));
      }
    }, []);

    return (
      <Stack spacing={2}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Character/Word (Left Side)"
              defaultValue={item.left || ""}
              onChange={(e) => {
                leftRef.current = e.target.value;
              }}
              onBlur={handleLeftBlur}
              placeholder="e.g., あ, こんにちは, 犬"
              helperText="The text that users will see and match"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Sound Label (Right Side)"
              defaultValue={item.right || ""}
              onChange={(e) => {
                rightRef.current = e.target.value;
              }}
              onBlur={handleRightBlur}
              placeholder="e.g., Sound of 'a', Greeting, Animal sound"
              helperText="Description of the sound (optional)"
            />
          </Grid>
        </Grid>

        {/* Audio URL Input */}
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            fullWidth
            label="Audio URL (MP3)"
            defaultValue={item.audioUrl || ""}
            onChange={(e) => {
              audioUrlRef.current = e.target.value;
            }}
            onBlur={handleAudioUrlBlur}
            placeholder="https://example.com/audio.mp3 or S3 URL"
            helperText="Upload MP3 file for the sound"
            InputProps={{
              startAdornment: (
                <VolumeUp sx={{ mr: 1, color: "action.active" }} />
              ),
            }}
          />
          <Tooltip title="Upload Audio">
            <IconButton color="primary" size="large">
              <CloudUpload />
            </IconButton>
          </Tooltip>
          {item.audioUrl && (
            <Tooltip title="Test Audio">
              <IconButton
                color="success"
                size="large"
                onClick={() => playAudio(item.audioUrl!)}
              >
                <PlayArrow />
              </IconButton>
            </Tooltip>
          )}
        </Stack>

        {/* Preview of the matching pair */}
        <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Preview:
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              label={item.left || "Character"}
              color="primary"
              variant="outlined"
              sx={{ minWidth: 100, fontSize: "1rem" }}
            />
            <Typography variant="body2" color="text.secondary">
              ↔️
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                icon={<VolumeUp />}
                label={item.right || "Audio"}
                color="secondary"
                variant="outlined"
                sx={{ minWidth: 100 }}
              />
              {!item.audioUrl && (
                <Typography variant="caption" color="error">
                  (No audio)
                </Typography>
              )}
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    );
  }
);

MatchingEditor.displayName = "MatchingEditor";

// ... rest of the editors remain the same
// Sorting Editor
interface SortingEditorProps {
  item: SortingItem;
  onUpdate: (updates: Partial<SortingItem>) => void;
}

export const SortingEditor: React.FC<SortingEditorProps> = memo(
  ({ item, onUpdate }) => {
    const textRef = useRef(item.text || "");

    const handleTextBlur = useCallback(() => {
      if (textRef.current !== (item.text || "")) {
        onUpdate({ text: textRef.current });
      }
    }, [item.text, onUpdate]);

    const handleOrderChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate({ correctOrder: parseInt(e.target.value) });
      },
      [onUpdate]
    );

    return (
      <Grid container spacing={2}>
        <Grid size={{ xs: 8 }}>
          <TextField
            fullWidth
            label="Item to Sort"
            defaultValue={item.text || ""}
            onChange={(e) => {
              textRef.current = e.target.value;
            }}
            onBlur={handleTextBlur}
            placeholder="e.g., 一 (one)"
          />
        </Grid>
        <Grid size={{ xs: 4 }}>
          <TextField
            fullWidth
            type="number"
            label="Correct Position"
            value={item.correctOrder || 0}
            onWheel={(e) => (e.target as HTMLInputElement).blur()}
            onChange={handleOrderChange}
            inputProps={{ min: 1 }}
            helperText="Position in final order"
          />
        </Grid>
      </Grid>
    );
  }
);

SortingEditor.displayName = "SortingEditor";

// Timeline Editor
interface TimelineEditorProps {
  item: TimelineItem;
  onUpdate: (updates: Partial<TimelineItem>) => void;
}

export const TimelineEditor: React.FC<TimelineEditorProps> = memo(
  ({ item, onUpdate }) => {
    const eventRef = useRef(item.event || "");
    const dateRef = useRef(item.date || "");
    const descriptionRef = useRef(item.description || "");

    const handleEventBlur = useCallback(() => {
      if (eventRef.current !== (item.event || "")) {
        onUpdate({ event: eventRef.current });
      }
    }, [item.event, onUpdate]);

    const handleDateBlur = useCallback(() => {
      if (dateRef.current !== (item.date || "")) {
        onUpdate({ date: dateRef.current });
      }
    }, [item.date, onUpdate]);

    const handleDescriptionBlur = useCallback(() => {
      if (descriptionRef.current !== (item.description || "")) {
        onUpdate({ description: descriptionRef.current });
      }
    }, [item.description, onUpdate]);

    return (
      <Stack spacing={2}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 8 }}>
            <TextField
              fullWidth
              label="Event"
              defaultValue={item.event || ""}
              onChange={(e) => {
                eventRef.current = e.target.value;
              }}
              onBlur={handleEventBlur}
              placeholder="e.g., Meiji Restoration"
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <TextField
              fullWidth
              label="Date/Year"
              defaultValue={item.date || ""}
              onChange={(e) => {
                dateRef.current = e.target.value;
              }}
              onBlur={handleDateBlur}
              placeholder="e.g., 1868"
            />
          </Grid>
        </Grid>
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Description"
          defaultValue={item.description || ""}
          onChange={(e) => {
            descriptionRef.current = e.target.value;
          }}
          onBlur={handleDescriptionBlur}
          placeholder="Brief description of the event"
        />
      </Stack>
    );
  }
);

TimelineEditor.displayName = "TimelineEditor";
