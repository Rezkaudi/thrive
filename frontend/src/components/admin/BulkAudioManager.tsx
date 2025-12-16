import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  Alert,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  LinearProgress,
} from "@mui/material";
import { CloudUpload, Delete, CheckCircle, Warning } from "@mui/icons-material";
import { CSVKeywordImport } from "../classroom/CSVKeywordImport";

export interface KeywordWithSentences {
  englishText: string;
  japaneseText: string;
  englishAudioUrl: string;
  japaneseAudioUrl: string;
  englishSentence?: string;
  japaneseSentence?: string;
  japaneseSentenceAudioUrl?: string;
}

interface BulkAudioManagerProps {
  open: boolean;
  onClose: () => void;
  keywords: KeywordWithSentences[];
  onApply: (keywords: KeywordWithSentences[]) => void;
}

const norm = (s?: string) => (s || "").trim();
const normKey = (k: Pick<KeywordWithSentences, "japaneseText" | "englishText">) =>
  `${norm(k.japaneseText).toLowerCase()}__${norm(k.englishText).toLowerCase()}`;

export const BulkAudioManager: React.FC<BulkAudioManagerProps> = ({
  open,
  onClose,
  keywords,
  onApply,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const clearAudioUrl = (
    keywordIndex: number,
    audioType: "japanese" | "english" | "japaneseSentence"
  ) => {
    const updated = keywords.map((k, i) =>
      i === keywordIndex
        ? {
            ...k,
            japaneseAudioUrl: audioType === "japanese" ? "" : k.japaneseAudioUrl,
            englishAudioUrl: audioType === "english" ? "" : k.englishAudioUrl,
            japaneseSentenceAudioUrl:
              audioType === "japaneseSentence" ? "" : k.japaneseSentenceAudioUrl,
          }
        : k
    );
    onApply(updated);
  };

  const handleImportedKeywords = (imported: KeywordWithSentences[]) => {
    const map = new Map<string, KeywordWithSentences>();

    for (const k of keywords) {
      map.set(normKey(k), {
        ...k,
        japaneseText: norm(k.japaneseText),
        englishText: norm(k.englishText),
        japaneseAudioUrl: norm(k.japaneseAudioUrl),
        englishAudioUrl: norm(k.englishAudioUrl),
        japaneseSentence: norm(k.japaneseSentence),
        englishSentence: norm(k.englishSentence),
        japaneseSentenceAudioUrl: norm(k.japaneseSentenceAudioUrl),
      });
    }

    for (const imp of imported) {
      const key = normKey(imp);
      if (!key) continue;
      const prev = map.get(key);
      if (prev) {
        map.set(key, {
          ...prev,
          japaneseText: norm(imp.japaneseText) || prev.japaneseText || "",
          englishText: norm(imp.englishText) || prev.englishText || "",
          japaneseAudioUrl: norm(imp.japaneseAudioUrl) || prev.japaneseAudioUrl || "",
          englishAudioUrl: norm(imp.englishAudioUrl) || prev.englishAudioUrl || "",
          japaneseSentence: norm(imp.japaneseSentence) || prev.japaneseSentence || "",
          englishSentence: norm(imp.englishSentence) || prev.englishSentence || "",
          japaneseSentenceAudioUrl:
            norm(imp.japaneseSentenceAudioUrl) || prev.japaneseSentenceAudioUrl || "",
        });
      } else {
        map.set(key, {
          japaneseText: norm(imp.japaneseText),
          englishText: norm(imp.englishText),
          japaneseAudioUrl: norm(imp.japaneseAudioUrl),
          englishAudioUrl: norm(imp.englishAudioUrl),
          japaneseSentence: norm(imp.japaneseSentence),
          englishSentence: norm(imp.englishSentence),
          japaneseSentenceAudioUrl: norm(imp.japaneseSentenceAudioUrl),
        });
      }
    }

    onApply(Array.from(map.values()));
    onClose();
  };

  const getCompletionStats = () => {
    const totalKeywords = Math.max(keywords.length, 1);
    const withBasic = keywords.filter((k) => k.japaneseAudioUrl && k.englishAudioUrl).length;
    const withSentence = keywords.filter((k) => k.japaneseSentenceAudioUrl).length;
    const withAll = keywords.filter(
      (k) => k.japaneseAudioUrl && k.englishAudioUrl && k.japaneseSentenceAudioUrl
    ).length;

    return {
      total: keywords.length,
      withBasic,
      withSentence,
      withAll,
      pctBasic: (withBasic / totalKeywords) * 100,
      pctSentence: (withSentence / totalKeywords) * 100,
      pctAll: (withAll / totalKeywords) * 100,
    };
  };

  const stats = getCompletionStats();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          <CloudUpload />
          <Typography variant="h6">Bulk Audio Manager</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
          <Tab label="CSV Import" />
          <Tab label="Manual Mapping" />
        </Tabs>

        {activeTab === 0 && (
          <Box>
            <CSVKeywordImport
              existing={keywords}
              onImport={(importedKeywords) => {
                handleImportedKeywords(importedKeywords as KeywordWithSentences[]);
              }}
            />
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              Review and manually adjust audio file assignments for each keyword.
            </Alert>

            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Japanese</TableCell>
                    <TableCell>English</TableCell>
                    <TableCell>Japanese Sentence</TableCell>
                    <TableCell align="center">JP Audio</TableCell>
                    <TableCell align="center">EN Audio</TableCell>
                    <TableCell align="center">JP Sentence Audio</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {keywords.map((keyword, index) => (
                    <TableRow key={`${keyword.japaneseText}-${keyword.englishText}-${index}`}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell
                        sx={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}
                        title={keyword.japaneseText}
                      >
                        {keyword.japaneseText}
                      </TableCell>
                      <TableCell
                        sx={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}
                        title={keyword.englishText}
                      >
                        {keyword.englishText}
                      </TableCell>
                      <TableCell
                        sx={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }}
                        title={keyword.japaneseSentence || "-"}
                      >
                        {keyword.japaneseSentence || "-"}
                      </TableCell>

                      <TableCell align="center">
                        {keyword.japaneseAudioUrl ? (
                          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                            <CheckCircle color="success" fontSize="small" />
                            <IconButton size="small" onClick={() => clearAudioUrl(index, "japanese")}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Stack>
                        ) : (
                          <Warning color="warning" fontSize="small" />
                        )}
                      </TableCell>

                      <TableCell align="center">
                        {keyword.englishAudioUrl ? (
                          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                            <CheckCircle color="success" fontSize="small" />
                            <IconButton size="small" onClick={() => clearAudioUrl(index, "english")}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Stack>
                        ) : (
                          <Warning color="warning" fontSize="small" />
                        )}
                      </TableCell>

                      <TableCell align="center">
                        {keyword.japaneseSentenceAudioUrl ? (
                          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                            <CheckCircle color="success" fontSize="small" />
                            <IconButton
                              size="small"
                              onClick={() => clearAudioUrl(index, "japaneseSentence")}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Stack>
                        ) : (
                          <Warning color="warning" fontSize="small" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 2 }}>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Basic Audio: {stats.withBasic} / {stats.total} keywords ({Math.round(stats.pctBasic) || 0}%)
                </Typography>
                <LinearProgress variant="determinate" value={stats.pctBasic} />

                <Typography variant="body2" color="text.secondary">
                  Sentence Audio: {stats.withSentence} / {stats.total} keywords ({Math.round(stats.pctSentence) || 0}%)
                </Typography>
                <LinearProgress variant="determinate" value={stats.pctSentence} />

                <Typography variant="body2" color="text.secondary">
                  Complete Audio: {stats.withAll} / {stats.total} keywords ({Math.round(stats.pctAll) || 0}%)
                </Typography>
                <LinearProgress variant="determinate" value={stats.pctAll} />
              </Stack>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
