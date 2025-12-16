import React from "react";
import { Control, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
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
import { BulkAudioManager } from "../admin/BulkAudioManager";

interface KeywordsFormProps {
  control: Control<LessonFormState>;
  errors: FieldErrors<LessonFormState>;
  isMobile: boolean;
  setValue: UseFormSetValue<LessonFormState>;
  watch: UseFormWatch<LessonFormState>;
  setBulkAudioDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

export const KeywordsForm: React.FC<KeywordsFormProps> = ({
  errors,
  isMobile,
  setValue,
  watch,
  setBulkAudioDialog,
}) => {
  const keywords = (watch("keywords") ?? []) as Keyword[];

  const writeKeywords = (next: Keyword[]) => {
    setValue("keywords", next, { shouldDirty: true, shouldValidate: true });
  };

  const addKeyword = () => {
    writeKeywords([
      ...keywords,
      {
        englishText: "",
        japaneseText: "",
        englishAudioUrl: "",
        japaneseAudioUrl: "",
        englishSentence: "",
        japaneseSentence: "",
        japaneseSentenceAudioUrl: "",
      },
    ]);
  };

  const removeKeyword = (index: number) => {
    const next = keywords.filter((_, i) => i !== index);
    writeKeywords(next);
  };

  const updateKeyword = (index: number, field: keyof Keyword, value: string) => {
    const next = [...keywords];
    next[index] = { ...next[index], [field]: value };
    writeKeywords(next);
  };

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

      {keywords.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center", bgcolor: "grey.50" }}>
          <Typography color="text.secondary" gutterBottom>
            No keywords added yet. You can:
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
            <Button variant="outlined" startIcon={<AddCircleOutline />} onClick={addKeyword}>
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
          {keywords.map((keyword, index) => (
            <Paper key={`${keyword.japaneseText}-${keyword.englishText}-${index}`} sx={{ p: 2 }}>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2" fontWeight={600}>
                    Keyword {index + 1}
                  </Typography>
                  <IconButton size="small" color="error" onClick={() => removeKeyword(index)}>
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
                      value={keyword.japaneseText}
                      onChange={(e) => updateKeyword(index, "japaneseText", e.target.value)}
                      placeholder="こんにちは"
                      InputProps={{ startAdornment: <Translate sx={{ mr: 1, color: "action.active" }} /> }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="English Text"
                      value={keyword.englishText}
                      onChange={(e) => updateKeyword(index, "englishText", e.target.value)}
                      placeholder="Hello"
                      InputProps={{ startAdornment: <Translate sx={{ mr: 1, color: "action.active" }} /> }}
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
                      value={keyword.japaneseSentence}
                      onChange={(e) => updateKeyword(index, "japaneseSentence", e.target.value)}
                      placeholder="こんにちは、元気ですか？"
                      InputProps={{ startAdornment: <Translate sx={{ mr: 1, color: "action.active" }} /> }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="English Sentence"
                      value={keyword.englishSentence}
                      onChange={(e) => updateKeyword(index, "englishSentence", e.target.value)}
                      placeholder="Hello, how are you?"
                      InputProps={{ startAdornment: <Translate sx={{ mr: 1, color: "action.active" }} /> }}
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
                      value={keyword.japaneseAudioUrl}
                      onChange={(e) => updateKeyword(index, "japaneseAudioUrl", e.target.value)}
                      placeholder="https://s3.../japanese-word.mp3"
                      InputProps={{ startAdornment: <VolumeUp sx={{ mr: 1, color: "action.active" }} /> }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="English Word Audio URL"
                      value={keyword.englishAudioUrl}
                      onChange={(e) => updateKeyword(index, "englishAudioUrl", e.target.value)}
                      placeholder="https://s3.../english-word.mp3"
                      InputProps={{ startAdornment: <VolumeUp sx={{ mr: 1, color: "action.active" }} /> }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Japanese Sentence Audio URL"
                      value={keyword.japaneseSentenceAudioUrl}
                      onChange={(e) =>
                        updateKeyword(index, "japaneseSentenceAudioUrl", e.target.value)
                      }
                      placeholder="https://s3.../japanese-sentence.mp3"
                      InputProps={{ startAdornment: <VolumeUp sx={{ mr: 1, color: "action.active" }} /> }}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      {keywords.length > 0 && <KeywordsSummary keywords={keywords} isMobile={isMobile} />}

      {/* Bulk Audio dialog trigger is managed in parent via setBulkAudioDialog */}
      <BulkAudioManager
        open={false} // not used; left for import reference only
        onClose={() => {}}
        keywords={keywords}
        onApply={() => {}}
      />
    </Box>
  );
};
