import { Box, FormControl, Grid, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { Slide } from "../../../types/slide.types";

interface InstructorNotesProps {
  slide: Slide;
  index: number;
  onUpdate: (index: number, updates: Partial<Slide>) => void;
}

export const InstructorNotes: React.FC<InstructorNotesProps> = ({
  slide,
  index,
  onUpdate,
}) => {
  return (
    <Stack spacing={3}>
      <TextField
        fullWidth
        multiline
        rows={4}
        label="Speaker Notes"
        value={slide.notes || ''}
        onChange={(e) => onUpdate(index, { notes: e.target.value })}
        helperText="These notes are only visible to instructors during presentation"
        placeholder="Add teaching notes, key points to emphasize, timing suggestions..."
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            type="number"
            label="Estimated Duration (minutes)"
            value={slide.duration || ''}
            onWheel={(e) => (e.target as HTMLInputElement).blur()}
            onChange={(e) => onUpdate(index, { duration: parseInt(e.target.value) || 0 })}
            inputProps={{ min: 0, max: 60 }}
            helperText="How long should this slide take?"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth size="small">
            <Typography variant="subtitle2" gutterBottom>
              Difficulty Level
            </Typography>
            <Select
              value={slide.difficulty || 'medium'}
              onChange={(e) => onUpdate(index, { difficulty: e.target.value })}
            >
              <MenuItem value="easy">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'success.main' }} />
                  <Typography>Easy</Typography>
                </Stack>
              </MenuItem>
              <MenuItem value="medium">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'warning.main' }} />
                  <Typography>Medium</Typography>
                </Stack>
              </MenuItem>
              <MenuItem value="hard">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'error.main' }} />
                  <Typography>Hard</Typography>
                </Stack>
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Learning Objectives */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Learning Objectives
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={2}
          placeholder="What should students learn from this slide? (e.g., 'Students will be able to...')"
          value={slide.learningObjectives || ''}
          onChange={(e) => onUpdate(index, { learningObjectives: e.target.value })}
        />
      </Box>

      {/* Tags */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Tags (comma-separated)
        </Typography>
        <TextField
          fullWidth
          placeholder="e.g., vocabulary, grammar, beginner, JLPT-N5"
          value={slide.tags || ''}
          onChange={(e) => onUpdate(index, { tags: e.target.value })}
          helperText="Tags help organize and search slides"
        />
      </Box>
    </Stack>
  );
};