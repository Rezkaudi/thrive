import React, { memo, useCallback } from "react";
import {
  Control,
  FieldErrors,
  useFieldArray,
  UseFormClearErrors,
} from "react-hook-form";
import {
  Box,
  Stack,
  Typography,
  Button,
  Paper,
  IconButton,
  TextField,
  Grid,
  Alert,
} from "@mui/material";
import {
  DeleteOutline,
  Translate,
  VolumeUp,
  AddCircleOutline,
  CloudUpload,
} from "@mui/icons-material";
import { Keyword, LessonFormState } from "../../types/lsesson-form.types";
import { KeywordsSummary } from "./KeywordsSummary";

interface KeywordsFormProps {
  control: Control<LessonFormState>;
  errors: FieldErrors<LessonFormState>;
  clearErrors: UseFormClearErrors<LessonFormState>;
  isMobile: boolean;
  setBulkAudioDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

// Memoized individual keyword item to prevent re-renders of all items when one changes
interface KeywordItemProps {
  index: number;
  keyword: Keyword;
  onUpdate: (index: number, field: keyof Keyword, value: string) => void;
  onRemove: (index: number) => void;
  onClearError: (index: number) => void;
}

const KeywordItem = memo<KeywordItemProps>(
  ({ index, keyword, onUpdate, onRemove, onClearError }) => {
    return (
      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle2" fontWeight={600}>
              Keyword {index + 1}
            </Typography>
            <IconButton
              size="small"
              color="error"
              onClick={() => onRemove(index)}
            >
              <DeleteOutline />
            </IconButton>
          </Stack>

          {/* Word Section */}
          <Typography variant="body2" fontWeight={500} color="primary">
            Word/Phrase
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Japanese Text"
                defaultValue={keyword.japaneseText}
                onChange={() => onClearError(index)}
                onBlur={(e) => onUpdate(index, "japaneseText", e.target.value)}
                placeholder="こんにちは"
                InputProps={{
                  startAdornment: (
                    <Translate sx={{ mr: 1, color: "action.active" }} />
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="English Text"
                defaultValue={keyword.englishText}
                onChange={() => onClearError(index)}
                onBlur={(e) => onUpdate(index, "englishText", e.target.value)}
                placeholder="Hello"
                InputProps={{
                  startAdornment: (
                    <Translate sx={{ mr: 1, color: "action.active" }} />
                  ),
                }}
              />
            </Grid>
          </Grid>

          {/* Sentence Section */}
          <Typography variant="body2" fontWeight={500} color="secondary">
            Example Sentences
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Japanese Sentence"
                defaultValue={keyword.japaneseSentence}
                onChange={() => onClearError(index)}
                onBlur={(e) =>
                  onUpdate(index, "japaneseSentence", e.target.value)
                }
                placeholder="こんにちは、元気ですか？"
                InputProps={{
                  startAdornment: (
                    <Translate sx={{ mr: 1, color: "action.active" }} />
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="English Sentence"
                defaultValue={keyword.englishSentence}
                onChange={() => onClearError(index)}
                onBlur={(e) =>
                  onUpdate(index, "englishSentence", e.target.value)
                }
                placeholder="Hello, how are you?"
                InputProps={{
                  startAdornment: (
                    <Translate sx={{ mr: 1, color: "action.active" }} />
                  ),
                }}
              />
            </Grid>
          </Grid>

          {/* Audio Section */}
          <Typography variant="body2" fontWeight={500} color="info">
            Audio Files
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Japanese Word Audio URL"
                defaultValue={keyword.japaneseAudioUrl}
                onChange={() => onClearError(index)}
                onBlur={(e) =>
                  onUpdate(index, "japaneseAudioUrl", e.target.value)
                }
                placeholder="https://s3.../japanese-word.mp3"
                InputProps={{
                  startAdornment: (
                    <VolumeUp sx={{ mr: 1, color: "action.active" }} />
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="English Word Audio URL"
                defaultValue={keyword.englishAudioUrl}
                onChange={() => onClearError(index)}
                onBlur={(e) =>
                  onUpdate(index, "englishAudioUrl", e.target.value)
                }
                placeholder="https://s3.../english-word.mp3"
                InputProps={{
                  startAdornment: (
                    <VolumeUp sx={{ mr: 1, color: "action.active" }} />
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Japanese Sentence Audio URL"
                defaultValue={keyword.japaneseSentenceAudioUrl}
                onChange={() => onClearError(index)}
                onBlur={(e) =>
                  onUpdate(index, "japaneseSentenceAudioUrl", e.target.value)
                }
                placeholder="https://s3.../japanese-sentence.mp3"
                InputProps={{
                  startAdornment: (
                    <VolumeUp sx={{ mr: 1, color: "action.active" }} />
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Stack>
      </Paper>
    );
  }
);

KeywordItem.displayName = "KeywordItem";

export const KeywordsForm: React.FC<KeywordsFormProps> = ({
  control,
  errors,
  clearErrors,
  isMobile,
  setBulkAudioDialog,
}) => {
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "keywords",
  });

  const addKeyword = useCallback(() => {
    append({
      englishText: "",
      japaneseText: "",
      englishAudioUrl: "",
      japaneseAudioUrl: "",
      englishSentence: "",
      japaneseSentence: "",
      japaneseSentenceAudioUrl: "",
    });
    clearErrors("keywords");
  }, [append, clearErrors]);

  const removeKeyword = useCallback(
    (index: number) => {
      remove(index);
    },
    [remove]
  );

  const updateKeyword = useCallback(
    (index: number, field: keyof Keyword, value: string) => {
      const currentField = fields[index];
      if (currentField) {
        update(index, { ...currentField, [field]: value });
        clearErrors("keywords");
        clearErrors(`keywords.${index}` as any);
      }
    },
    [fields, update, clearErrors]
  );

  const clearKeywordError = useCallback(
    (index: number) => {
      clearErrors("keywords");
      clearErrors(`keywords.${index}` as any);
    },
    [clearErrors]
  );

  return (
    <Box>
      <Stack
        direction={isMobile ? "column" : "row"}
        justifyContent="space-between"
        gap={1}
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Keywords</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<AddCircleOutline />}
            onClick={addKeyword}
            variant="outlined"
            size="small"
          >
            Add Keyword
          </Button>
          <Button
            variant="outlined"
            startIcon={<CloudUpload />}
            onClick={() => setBulkAudioDialog(true)}
            color="secondary"
            size="small"
          >
            Import from CSV
          </Button>
        </Stack>
      </Stack>

      {errors.keywords && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {String(errors.keywords.message ?? "Please fix keyword errors")}
        </Alert>
      )}

      {fields.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center", bgcolor: "grey.50" }}>
          <Typography color="text.secondary" gutterBottom>
            No keywords added yet. You can:
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            sx={{ mt: 2 }}
          >
            <Button
              variant="outlined"
              startIcon={<AddCircleOutline />}
              onClick={addKeyword}
            >
              Add Manually
            </Button>
            <Button
              variant="outlined"
              startIcon={<CloudUpload />}
              onClick={() => setBulkAudioDialog(true)}
              color="secondary"
            >
              Import from CSV
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {fields.map((field, index) => (
            <KeywordItem
              key={field.id}
              index={index}
              keyword={field as Keyword}
              onUpdate={updateKeyword}
              onRemove={removeKeyword}
              onClearError={clearKeywordError}
            />
          ))}
        </Stack>
      )}

      {fields.length > 0 && (
        <KeywordsSummary keywords={fields as Keyword[]} isMobile={isMobile} />
      )}
    </Box>
  );
};
