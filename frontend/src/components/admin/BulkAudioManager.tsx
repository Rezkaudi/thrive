import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Stack,
  Chip,
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
  FormControlLabel,
  Checkbox,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload,
  VolumeUp,
  Delete,
  ContentPaste,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { CSVKeywordImport } from '../classroom/CSVKeywordImport';

interface AudioMapping {
  keyword: string;
  japaneseAudioUrl: string;
  englishAudioUrl: string;
}

interface BulkAudioManagerProps {
  open: boolean;
  onClose: () => void;
  keywords: Array<{
    englishText: string;
    japaneseText: string;
    englishAudioUrl: string;
    japaneseAudioUrl: string;
  }>;
  onApply: (keywords: Array<{
    englishText: string;
    japaneseText: string;
    englishAudioUrl: string;
    japaneseAudioUrl: string;
  }>) => void;
}

export const BulkAudioManager: React.FC<BulkAudioManagerProps> = ({
  open,
  onClose,
  keywords,
  onApply,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [bulkUrls, setBulkUrls] = useState('');
  const [audioMappings, setAudioMappings] = useState<AudioMapping[]>([]);
  const [autoMatch, setAutoMatch] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Parse bulk URLs input
  const parseBulkUrls = () => {
    setProcessing(true);
    const lines = bulkUrls.trim().split('\n').filter(line => line.trim());
    const mappings: AudioMapping[] = [];

    lines.forEach(line => {
      // Expected format: "keyword_jp.mp3 https://s3.../file.mp3"
      // or "keyword_en.mp3 https://s3.../file.mp3"
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2) {
        const filename = parts[0];
        const url = parts[1];

        // Try to extract keyword and language from filename
        const nameWithoutExt = filename.replace(/\.(mp3|wav|m4a)$/i, '');
        const isJapanese = nameWithoutExt.match(/(_jp|_japanese|_ja)$/i);
        const isEnglish = nameWithoutExt.match(/(_en|_english)$/i);

        if (isJapanese || isEnglish) {
          const keyword = nameWithoutExt.replace(/(_jp|_japanese|_ja|_en|_english)$/i, '');

          let mapping = mappings.find(m => m.keyword.toLowerCase() === keyword.toLowerCase());
          if (!mapping) {
            mapping = { keyword, japaneseAudioUrl: '', englishAudioUrl: '' };
            mappings.push(mapping);
          }

          if (isJapanese) {
            mapping.japaneseAudioUrl = url;
          } else if (isEnglish) {
            mapping.englishAudioUrl = url;
          }
        }
      }
    });

    setAudioMappings(mappings);

    // Auto-match with keywords if enabled
    if (autoMatch) {
      autoMatchKeywords(mappings);
    }

    setProcessing(false);
  };

  // Auto-match audio files with keywords
  const autoMatchKeywords = (mappings: AudioMapping[]) => {
    const updatedKeywords = [...keywords];

    mappings.forEach(mapping => {
      // Try to find matching keyword by Japanese or English text
      const keywordIndex = updatedKeywords.findIndex(k =>
        k.japaneseText.toLowerCase().includes(mapping.keyword.toLowerCase()) ||
        k.englishText.toLowerCase().includes(mapping.keyword.toLowerCase()) ||
        mapping.keyword.toLowerCase().includes(k.japaneseText.toLowerCase()) ||
        mapping.keyword.toLowerCase().includes(k.englishText.toLowerCase())
      );

      if (keywordIndex !== -1) {
        if (mapping.japaneseAudioUrl) {
          updatedKeywords[keywordIndex].japaneseAudioUrl = mapping.japaneseAudioUrl;
        }
        if (mapping.englishAudioUrl) {
          updatedKeywords[keywordIndex].englishAudioUrl = mapping.englishAudioUrl;
        }
      }
    });

    onApply(updatedKeywords);
  };

  // Manual mapping
  // const applyManualMapping = (keywordIndex: number, mapping: AudioMapping, language: 'japanese' | 'english') => {
  //   const updatedKeywords = [...keywords];
  //   if (language === 'japanese') {
  //     updatedKeywords[keywordIndex].japaneseAudioUrl = mapping.japaneseAudioUrl;
  //   } else {
  //     updatedKeywords[keywordIndex].englishAudioUrl = mapping.englishAudioUrl;
  //   }
  //   onApply(updatedKeywords);
  // };

  // Clear audio URL
  const clearAudioUrl = (keywordIndex: number, language: 'japanese' | 'english') => {
    const updatedKeywords = [...keywords];
    if (language === 'japanese') {
      updatedKeywords[keywordIndex].japaneseAudioUrl = '';
    } else {
      updatedKeywords[keywordIndex].englishAudioUrl = '';
    }
    onApply(updatedKeywords);
  };

  const handlePasteExample = () => {
    setBulkUrls(`konnichiwa_jp.mp3 https://s3.amazonaws.com/mybucket/audio/konnichiwa_jp.mp3
konnichiwa_en.mp3 https://s3.amazonaws.com/mybucket/audio/konnichiwa_en.mp3
arigatou_jp.mp3 https://s3.amazonaws.com/mybucket/audio/arigatou_jp.mp3
arigatou_en.mp3 https://s3.amazonaws.com/mybucket/audio/arigatou_en.mp3
sayonara_jp.mp3 https://s3.amazonaws.com/mybucket/audio/sayonara_jp.mp3
sayonara_en.mp3 https://s3.amazonaws.com/mybucket/audio/sayonara_en.mp3`);
  };

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
          {/* <Tab label="Bulk Audio URLs" /> */}
          <Tab label="CSV Import" />
          <Tab label="Manual Mapping" />
        </Tabs>

        {/* {activeTab === 0 && (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              Paste your audio file URLs in the format: <strong>filename URL</strong> (one per line).
              Use naming convention: keyword_jp.mp3 or keyword_en.mp3 for automatic matching.
            </Alert>

            <Stack spacing={2}>
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle2">Paste Audio URLs</Typography>
                  <Button
                    size="small"
                    startIcon={<ContentPaste />}
                    onClick={handlePasteExample}
                  >
                    Paste Example
                  </Button>
                </Stack>
                <TextField
                  multiline
                  rows={10}
                  fullWidth
                  placeholder={`konnichiwa_jp.mp3 https://s3.../konnichiwa_jp.mp3
konnichiwa_en.mp3 https://s3.../konnichiwa_en.mp3
arigatou_jp.mp3 https://s3.../arigatou_jp.mp3
...`}
                  value={bulkUrls}
                  onChange={(e) => setBulkUrls(e.target.value)}
                />
              </Box>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={autoMatch}
                    onChange={(e) => setAutoMatch(e.target.checked)}
                  />
                }
                label="Automatically match with keywords"
              />

              <Button
                variant="contained"
                onClick={parseBulkUrls}
                disabled={!bulkUrls.trim() || processing}
                fullWidth
              >
                {processing ? 'Processing...' : 'Process and Match'}
              </Button>

              {processing && <LinearProgress />}

              {audioMappings.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Detected Audio Files ({audioMappings.length})
                  </Typography>
                  <Paper sx={{ p: 2, maxHeight: 200, overflow: 'auto' }}>
                    <Stack spacing={1}>
                      {audioMappings.map((mapping, index) => (
                        <Stack key={index} direction="row" spacing={2} alignItems="center">
                          <Chip
                            label={mapping.keyword}
                            size="small"
                            icon={<VolumeUp />}
                          />
                          {mapping.japaneseAudioUrl && (
                            <Chip
                              label="JP"
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                          {mapping.englishAudioUrl && (
                            <Chip
                              label="EN"
                              size="small"
                              color="secondary"
                              variant="outlined"
                            />
                          )}
                        </Stack>
                      ))}
                    </Stack>
                  </Paper>
                </Box>
              )}
            </Stack>
          </Box>
        )} */}

        {activeTab === 0 && (
          <Box>
            <CSVKeywordImport
              onImport={(importedKeywords) => {
                onApply(importedKeywords);
                onClose();
              }}
            />
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              Review and manually adjust audio file assignments for each keyword.
            </Alert>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Keyword</TableCell>
                    <TableCell>Japanese</TableCell>
                    <TableCell>English</TableCell>
                    <TableCell align="center">Japanese Audio</TableCell>
                    <TableCell align="center">English Audio</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {keywords.map((keyword, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{keyword.japaneseText}</TableCell>
                      <TableCell>{keyword.englishText}</TableCell>
                      <TableCell align="center">
                        {keyword.japaneseAudioUrl ? (
                          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                            <CheckCircle color="success" fontSize="small" />
                            <IconButton
                              size="small"
                              onClick={() => clearAudioUrl(index, 'japanese')}
                            >
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
                            <IconButton
                              size="small"
                              onClick={() => clearAudioUrl(index, 'english')}
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
              <Typography variant="body2" color="text.secondary">
                {keywords.filter(k => k.japaneseAudioUrl && k.englishAudioUrl).length} / {keywords.length} keywords have complete audio
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(keywords.filter(k => k.japaneseAudioUrl && k.englishAudioUrl).length / keywords.length) * 100}
                sx={{ mt: 1 }}
              />
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