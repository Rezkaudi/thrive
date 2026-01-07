import React, { memo, useCallback, useRef } from "react";
import { Stack, TextField } from "@mui/material";
import { FillBlanksItem } from "../../../../../types/interactive-items.types";

interface FillBlanksEditorProps {
  item: FillBlanksItem;
  onUpdate: (updates: Partial<FillBlanksItem>) => void;
}

export const FillBlanksEditor: React.FC<FillBlanksEditorProps> = memo(
  ({ item, onUpdate }) => {
    const sentenceRef = useRef(item.sentence || "");
    const blanksRef = useRef(
      Array.isArray(item.blanks) ? item.blanks.join(", ") : ""
    );
    const translationRef = useRef(item.translation || "");

    const handleSentenceBlur = useCallback(() => {
      if (sentenceRef.current !== (item.sentence || "")) {
        onUpdate({ sentence: sentenceRef.current });
      }
    }, [item.sentence, onUpdate]);

    const handleBlanksBlur = useCallback(() => {
      const newBlanks = blanksRef.current
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const currentBlanks = Array.isArray(item.blanks)
        ? item.blanks.join(", ")
        : "";
      if (blanksRef.current !== currentBlanks) {
        onUpdate({ blanks: newBlanks });
      }
    }, [item.blanks, onUpdate]);

    const handleTranslationBlur = useCallback(() => {
      if (translationRef.current !== (item.translation || "")) {
        onUpdate({ translation: translationRef.current });
      }
    }, [item.translation, onUpdate]);

    return (
      <Stack spacing={2}>
        <TextField
          fullWidth
          label="Sentence with Blanks"
          defaultValue={item.sentence || ""}
          onChange={(e) => {
            sentenceRef.current = e.target.value;
          }}
          onBlur={handleSentenceBlur}
          placeholder="Use ___ for blanks: I am ___ student"
          helperText="Use underscores (___) to mark where students should fill in words"
        />
        <TextField
          fullWidth
          label="Correct Answers (comma-separated)"
          defaultValue={
            Array.isArray(item.blanks) ? item.blanks.join(", ") : ""
          }
          onChange={(e) => {
            blanksRef.current = e.target.value;
          }}
          onBlur={handleBlanksBlur}
          placeholder="e.g., a, student, learning"
          helperText="Multiple correct answers separated by commas"
        />
        <TextField
          fullWidth
          label="Translation (optional)"
          defaultValue={item.translation || ""}
          onChange={(e) => {
            translationRef.current = e.target.value;
          }}
          onBlur={handleTranslationBlur}
          placeholder="e.g., I am a student"
        />
      </Stack>
    );
  }
);

FillBlanksEditor.displayName = "FillBlanksEditor";
