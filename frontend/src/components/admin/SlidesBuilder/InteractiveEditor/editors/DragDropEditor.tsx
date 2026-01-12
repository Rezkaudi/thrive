import React, { memo, useCallback, useRef } from "react";
import { Stack, TextField, Grid } from "@mui/material";
import { DragDropItem } from "../../../../../types/interactive-items.types";

interface DragDropEditorProps {
  item: DragDropItem;
  onUpdate: (updates: Partial<DragDropItem>) => void;
}

export const DragDropEditor: React.FC<DragDropEditorProps> = memo(
  ({ item, onUpdate }) => {
    // Use refs to track current values for onBlur handlers
    const textRef = useRef(item.text || "");
    const targetRef = useRef(item.target || "");
    const categoryRef = useRef(item.category || "");

    const handleTextBlur = useCallback(() => {
      if (textRef.current !== (item.text || "")) {
        onUpdate({ text: textRef.current });
      }
    }, [item.text, onUpdate]);

    const handleTargetBlur = useCallback(() => {
      if (targetRef.current !== (item.target || "")) {
        onUpdate({ target: targetRef.current });
      }
    }, [item.target, onUpdate]);

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
              label="Draggable Item"
              defaultValue={item.text || ""}
              onChange={(e) => {
                textRef.current = e.target.value;
              }}
              onBlur={handleTextBlur}
              placeholder="e.g., こんにちは"
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              label="Target/Answer"
              defaultValue={item.target || ""}
              onChange={(e) => {
                targetRef.current = e.target.value;
              }}
              onBlur={handleTargetBlur}
              placeholder="e.g., Hello"
            />
          </Grid>
        </Grid>
        <TextField
          fullWidth
          label="Category (optional)"
          defaultValue={item.category || ""}
          onChange={(e) => {
            categoryRef.current = e.target.value;
          }}
          onBlur={handleCategoryBlur}
          placeholder="e.g., Greetings"
          helperText="Group related items together"
        />
      </Stack>
    );
  }
);

DragDropEditor.displayName = "DragDropEditor";
