import React, { memo } from "react";
import {
  Stack,
  Grid,
  TextField,
  IconButton,
  Tooltip,
  Paper,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  Select,
  MenuItem,
  Box,
} from "@mui/material";
import { ColorLens, Wallpaper, CloudUpload } from "@mui/icons-material";
import { Slide, SlideContent } from "../../../types/slide.types";

export interface SlideStylingProps {
  slide: Slide;
  index: number;
  onUpdate: (index: number, updates: Partial<Slide>) => void;
  onUpdateContent: (
    index: number,
    contentUpdates: Partial<SlideContent>
  ) => void;
}

export const SlideStyling: React.FC<SlideStylingProps> = memo(
  ({ slide, index, onUpdate, onUpdateContent }) => {
    return (
      <Stack spacing={3}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Background Color"
              defaultValue={slide.backgroundColor || ""}
              onBlur={(e) =>
                onUpdate(index, { backgroundColor: e.target.value })
              }
              placeholder="#ffffff"
              InputProps={{
                startAdornment: (
                  <IconButton size="small">
                    <ColorLens
                      sx={{ color: slide.backgroundColor || "action.active" }}
                    />
                  </IconButton>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Background Image URL"
              defaultValue={slide.backgroundImage || ""}
              onBlur={(e) =>
                onUpdate(index, { backgroundImage: e.target.value })
              }
              InputProps={{
                startAdornment: (
                  <Wallpaper sx={{ mr: 1, color: "action.active" }} />
                ),
                endAdornment: (
                  <Tooltip title="Upload Background Image">
                    <IconButton size="small">
                      <CloudUpload />
                    </IconButton>
                  </Tooltip>
                ),
              }}
            />
          </Grid>
        </Grid>

        {/* Background Preview */}
        {(slide.backgroundColor || slide.backgroundImage) && (
          <Paper
            sx={{
              height: 120,
              bgcolor: slide.backgroundColor || "background.paper",
              backgroundImage: slide.backgroundImage
                ? `url(${slide.backgroundImage})`
                : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px dashed",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                bgcolor: "rgba(255,255,255,0.8)",
                p: 1,
                borderRadius: 1,
                color: "text.primary",
              }}
            >
              Background Preview
            </Typography>
          </Paper>
        )}

        {/* Layout Options */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Content Alignment
          </Typography>
          <RadioGroup
            row
            value={slide.content.alignment || "center"}
            onChange={(e) =>
              onUpdateContent(index, {
                alignment: e.target.value as "left" | "center" | "right",
              })
            }
          >
            <FormControlLabel value="left" control={<Radio />} label="Left" />
            <FormControlLabel
              value="center"
              control={<Radio />}
              label="Center"
            />
            <FormControlLabel value="right" control={<Radio />} label="Right" />
          </RadioGroup>
        </Box>

        {/* Animation Options */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Slide Transition
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={slide.transition || "slide"}
              onChange={(e) => onUpdate(index, { transition: e.target.value })}
            >
              <MenuItem value="slide">Slide</MenuItem>
              <MenuItem value="fade">Fade</MenuItem>
              <MenuItem value="zoom">Zoom</MenuItem>
              <MenuItem value="flip">Flip</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Stack>
    );
  }
);

SlideStyling.displayName = "SlideStyling";
