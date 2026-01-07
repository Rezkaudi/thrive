import React, { memo, useCallback, useRef } from "react";
import {
  Stack,
  Typography,
  FormControlLabel,
  Switch,
  TextField,
  Box,
  Slider,
  IconButton,
  Tooltip,
  Alert,
} from "@mui/material";
import { PhotoLibrary } from "@mui/icons-material";

interface InteractiveSettingsProps {
  type: string;
  settings: any;
  onUpdate: (newSettings: any) => void;
}

export const InteractiveSettings: React.FC<InteractiveSettingsProps> = memo(
  ({ type, settings, onUpdate }) => {
    const imageUrlRef = useRef(settings.imageUrl || "");

    const handleImageUrlBlur = useCallback(() => {
      if (imageUrlRef.current !== (settings.imageUrl || "")) {
        onUpdate({ imageUrl: imageUrlRef.current });
      }
    }, [settings.imageUrl, onUpdate]);
    switch (type) {
      case "drag-drop":
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Drag & Drop Settings
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showHints || false}
                  onChange={(e) => onUpdate({ showHints: e.target.checked })}
                />
              }
              label="Show hints for target areas"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.snapToTarget !== false}
                  onChange={(e) => onUpdate({ snapToTarget: e.target.checked })}
                />
              }
              label="Snap items to targets when dropped nearby"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.allowMultipleAttempts !== false}
                  onChange={(e) =>
                    onUpdate({ allowMultipleAttempts: e.target.checked })
                  }
                />
              }
              label="Allow multiple attempts"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.shuffleItems || false}
                  onChange={(e) => onUpdate({ shuffleItems: e.target.checked })}
                />
              }
              label="Shuffle draggable items"
            />
          </Stack>
        );

      case "hotspot":
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Hotspot Settings
            </Typography>
            <TextField
              fullWidth
              label="Background Image URL"
              defaultValue={settings.imageUrl || ""}
              onChange={(e) => {
                imageUrlRef.current = e.target.value;
              }}
              onBlur={handleImageUrlBlur}
              placeholder="S3 URL for the background image"
              InputProps={{
                endAdornment: (
                  <Tooltip title="Upload Image">
                    <IconButton>
                      <PhotoLibrary />
                    </IconButton>
                  </Tooltip>
                ),
              }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showAllHotspots || false}
                  onChange={(e) =>
                    onUpdate({ showAllHotspots: e.target.checked })
                  }
                />
              }
              label="Show all hotspot indicators initially"
            />
            <Box>
              <Typography gutterBottom>Hotspot Size</Typography>
              <Slider
                value={settings.hotspotSize || 40}
                onChange={(e, value) => onUpdate({ hotspotSize: value })}
                min={20}
                max={80}
                valueLabelDisplay="auto"
                marks={[
                  { value: 20, label: "Small" },
                  { value: 40, label: "Medium" },
                  { value: 80, label: "Large" },
                ]}
              />
            </Box>
          </Stack>
        );

      case "pronunciation":
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Pronunciation Settings
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableRecording !== false}
                  onChange={(e) =>
                    onUpdate({ enableRecording: e.target.checked })
                  }
                />
              }
              label="Enable student recording"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showWaveform || false}
                  onChange={(e) => onUpdate({ showWaveform: e.target.checked })}
                />
              }
              label="Show audio waveform visualization"
            />
            <Box>
              <Typography gutterBottom>
                Recording Time Limit (seconds)
              </Typography>
              <Slider
                value={settings.recordingTimeLimit || 30}
                onChange={(e, value) => onUpdate({ recordingTimeLimit: value })}
                min={10}
                max={120}
                valueLabelDisplay="auto"
                marks={[
                  { value: 10, label: "10s" },
                  { value: 30, label: "30s" },
                  { value: 60, label: "1m" },
                  { value: 120, label: "2m" },
                ]}
              />
            </Box>
          </Stack>
        );

      case "flashcard":
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Flashcard Settings
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.shuffleCards || false}
                  onChange={(e) => onUpdate({ shuffleCards: e.target.checked })}
                />
              }
              label="Shuffle cards on each attempt"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoAdvance || false}
                  onChange={(e) => onUpdate({ autoAdvance: e.target.checked })}
                />
              }
              label="Auto-advance to next card after 3 seconds"
            />
            <Box>
              <Typography gutterBottom>Cards per session</Typography>
              <Slider
                value={settings.cardsPerSession || 10}
                onChange={(e, value) => onUpdate({ cardsPerSession: value })}
                min={5}
                max={50}
                valueLabelDisplay="auto"
                marks={[
                  { value: 5, label: "5" },
                  { value: 10, label: "10" },
                  { value: 25, label: "25" },
                  { value: 50, label: "50" },
                ]}
              />
            </Box>
          </Stack>
        );

      case "listening":
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Listening Settings
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.allowReplay !== false}
                  onChange={(e) => onUpdate({ allowReplay: e.target.checked })}
                />
              }
              label="Allow students to replay audio"
            />
            <Box>
              <Typography gutterBottom>Maximum Replays</Typography>
              <Slider
                value={settings.maxReplays || 3}
                onChange={(e, value) => onUpdate({ maxReplays: value })}
                min={1}
                max={10}
                valueLabelDisplay="auto"
                disabled={!settings.allowReplay}
              />
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showTranscript || false}
                  onChange={(e) =>
                    onUpdate({ showTranscript: e.target.checked })
                  }
                />
              }
              label="Show transcript after completion"
            />
          </Stack>
        );

      case "matching":
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Matching Settings
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.shuffleItems !== false}
                  onChange={(e) => onUpdate({ shuffleItems: e.target.checked })}
                />
              }
              label="Shuffle matching items"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showLines || false}
                  onChange={(e) => onUpdate({ showLines: e.target.checked })}
                />
              }
              label="Show connection lines"
            />
          </Stack>
        );

      case "sorting":
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Sorting Settings
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.shuffleItems !== false}
                  onChange={(e) => onUpdate({ shuffleItems: e.target.checked })}
                />
              }
              label="Shuffle items initially"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showNumbers || false}
                  onChange={(e) => onUpdate({ showNumbers: e.target.checked })}
                />
              }
              label="Show position numbers"
            />
          </Stack>
        );

      default:
        return (
          <Alert severity="info">
            No specific settings available for this interactive type.
          </Alert>
        );
    }
  }
);

InteractiveSettings.displayName = "InteractiveSettings";
