import React from "react";
import { Paper, Stack, Typography, Chip, Alert } from "@mui/material";
import { Keyword } from "../../types/lsesson-form.types";

interface KeywordsSummaryProps {
  keywords: Keyword[];
  isMobile: boolean;
}

export const KeywordsSummary: React.FC<KeywordsSummaryProps> = ({ keywords, isMobile }) => {
  const stats = {
    total: keywords.length,
    withJPAudio: keywords.filter((k) => k.japaneseAudioUrl).length,
    withENAudio: keywords.filter((k) => k.englishAudioUrl).length,
    withENSentences: keywords.filter((k) => k.englishSentence).length,
    withJPSentences: keywords.filter((k) => k.japaneseSentence).length,
    withJPSentenceAudio: keywords.filter((k) => k.japaneseSentenceAudioUrl).length,
  };

  const getChipColor = (count: number, total: number) =>
    (count === total ? "success" : "warning") as any;

  return (
    <Paper sx={{ p: 2, mt: 2, bgcolor: "grey.50" }}>
      <Stack spacing={1}>
        <Typography variant="subtitle2">Summary</Typography>
        <Stack direction={isMobile ? "column" : "row"} spacing={2} flexWrap="wrap">
          <Chip label={`${stats.total} total keywords`} size="small" />
          <Chip label={`${stats.withJPAudio} with JP word audio`} size="small" color={getChipColor(stats.withJPAudio, stats.total)} />
          <Chip label={`${stats.withENAudio} with EN word audio`} size="small" color={getChipColor(stats.withENAudio, stats.total)} />
          <Chip label={`${stats.withENSentences} with EN sentences`} size="small" color={getChipColor(stats.withENSentences, stats.total)} />
          <Chip label={`${stats.withJPSentences} with JP sentences`} size="small" color={getChipColor(stats.withJPSentences, stats.total)} />
          <Chip label={`${stats.withJPSentenceAudio} with JP sentence audio`} size="small" color={getChipColor(stats.withJPSentenceAudio, stats.total)} />
        </Stack>

        {(stats.withJPAudio < stats.total || stats.withENAudio < stats.total) && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            Some keywords are missing word audio files. Consider using the Bulk Audio manager to import them.
          </Alert>
        )}
        {(stats.withENSentences < stats.total || stats.withJPSentences < stats.total) && (
          <Alert severity="info" sx={{ mt: 1 }}>
            Some keywords are missing example sentences. Adding sentences helps learners understand context and usage.
          </Alert>
        )}
        {keywords.some((k) => k.japaneseSentence && !k.japaneseSentenceAudioUrl) && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            Some Japanese sentences are missing audio pronunciation.
          </Alert>
        )}
      </Stack>
    </Paper>
  );
};
