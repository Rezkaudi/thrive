import React, { memo, useCallback, useRef } from "react";
import { Stack, TextField, Grid, Box, Typography, Paper } from "@mui/material";
import { FlashcardItem } from "../../../../../types/interactive-items.types";

interface FlashcardEditorProps {
  item: FlashcardItem;
  onUpdate: (updates: Partial<FlashcardItem>) => void;
}

export const FlashcardEditor: React.FC<FlashcardEditorProps> = memo(
  ({ item, onUpdate }) => {
    const frontRef = useRef(item.front || "");
    const backRef = useRef(item.back || "");
    const categoryRef = useRef(item.category || "");

    const handleFrontBlur = useCallback(() => {
      if (frontRef.current !== (item.front || "")) {
        onUpdate({ front: frontRef.current });
      }
    }, [item.front, onUpdate]);

    const handleBackBlur = useCallback(() => {
      if (backRef.current !== (item.back || "")) {
        onUpdate({ back: backRef.current });
      }
    }, [item.back, onUpdate]);

    const handleCategoryBlur = useCallback(() => {
      if (categoryRef.current !== (item.category || "")) {
        onUpdate({ category: categoryRef.current });
      }
    }, [item.category, onUpdate]);

    return (
      <Stack spacing={2}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Front of Card"
              defaultValue={item.front || ""}
              onChange={(e) => {
                frontRef.current = e.target.value;
              }}
              onBlur={handleFrontBlur}
              placeholder="e.g., 漢字"
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Back of Card"
              defaultValue={item.back || ""}
              onChange={(e) => {
                backRef.current = e.target.value;
              }}
              onBlur={handleBackBlur}
              placeholder="e.g., Kanji - Chinese characters"
            />
          </Grid>
        </Grid>

        <TextField
          fullWidth
          label="Category"
          defaultValue={item.category || ""}
          onChange={(e) => {
            categoryRef.current = e.target.value;
          }}
          onBlur={handleCategoryBlur}
          placeholder="e.g., Vocabulary, Grammar"
        />

        {/* Flashcard Preview */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            Card Preview:
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Paper
              sx={{
                p: 2,
                minHeight: 100,
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "primary.light",
                color: "primary.contrastText",
              }}
            >
              <Typography variant="body1" textAlign="center">
                {item.front || "Front"}
              </Typography>
            </Paper>
            <Paper
              sx={{
                p: 2,
                minHeight: 100,
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "secondary.light",
              }}
            >
              <Typography variant="body1" textAlign="center">
                {item.back || "Back"}
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Stack>
    );
  }
);

FlashcardEditor.displayName = "FlashcardEditor";
