import React, { useState } from 'react';
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
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { CSVKeywordImport } from '../classroom/CSVKeywordImport';

// interface AudioMapping {
//   keyword: string;
//   japaneseAudioUrl: string;
//   englishAudioUrl: string;
//   japaneseSentenceAudioUrl: string;
// }

interface KeywordWithSentences {
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

export const BulkAudioManager: React.FC<BulkAudioManagerProps> = ({
  open,
  onClose,
  keywords,
  onApply,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  // const [bulkUrls, setBulkUrls] = useState('');
  // const [audioMappings, setAudioMappings] = useState<AudioMapping[]>([]);
  // const [autoMatch, setAutoMatch] = useState(true);
  // const [processing, setProcessing] = useState(false);

  // Parse bulk URLs input
  // const parseBulkUrls = () => {
  //   setProcessing(true);
  //   const lines = bulkUrls.trim().split('\n').filter(line => line.trim());
  //   const mappings: AudioMapping[] = [];

  //   lines.forEach(line => {
  //     // Expected format: "keyword_jp.mp3 https://s3.../file.mp3"
  //     // or "keyword_en.mp3 https://s3.../file.mp3"
  //     // or "keyword_sentence_jp.mp3 https://s3.../file.mp3"
  //     const parts = line.trim().split(/\s+/);
  //     if (parts.length >= 2) {
  //       const filename = parts[0];
  //       const url = parts[1];

  //       // Try to extract keyword and language from filename
  //       const nameWithoutExt = filename.replace(/\.(mp3|wav|m4a)$/i, '');
  //       const isSentenceJapanese = nameWithoutExt.match(/(_sentence_jp|_sentence_japanese|_sentence_ja)$/i);
  //       const isJapanese = nameWithoutExt.match(/(_jp|_japanese|_ja)$/i);
  //       const isEnglish = nameWithoutExt.match(/(_en|_english)$/i);

  //       if (isSentenceJapanese || isJapanese || isEnglish) {
  //         let keyword: string;

  //         if (isSentenceJapanese) {
  //           keyword = nameWithoutExt.replace(/(_sentence_jp|_sentence_japanese|_sentence_ja)$/i, '');
  //         } else if (isJapanese) {
  //           keyword = nameWithoutExt.replace(/(_jp|_japanese|_ja)$/i, '');
  //         } else {
  //           keyword = nameWithoutExt.replace(/(_en|_english)$/i, '');
  //         }

  //         let mapping = mappings.find(m => m.keyword.toLowerCase() === keyword.toLowerCase());
  //         if (!mapping) {
  //           mapping = { 
  //             keyword, 
  //             japaneseAudioUrl: '', 
  //             englishAudioUrl: '', 
  //             japaneseSentenceAudioUrl: '' 
  //           };
  //           mappings.push(mapping);
  //         }

  //         if (isSentenceJapanese) {
  //           mapping.japaneseSentenceAudioUrl = url;
  //         } else if (isJapanese) {
  //           mapping.japaneseAudioUrl = url;
  //         } else if (isEnglish) {
  //           mapping.englishAudioUrl = url;
  //         }
  //       }
  //     }
  //   });

  //   setAudioMappings(mappings);

  //   // Auto-match with keywords if enabled
  //   if (autoMatch) {
  //     autoMatchKeywords(mappings);
  //   }

  //   setProcessing(false);
  // };

  // Auto-match audio files with keywords
  // const autoMatchKeywords = (mappings: AudioMapping[]) => {
  //   const updatedKeywords = [...keywords];

  //   mappings.forEach(mapping => {
  //     // Try to find matching keyword by Japanese or English text
  //     const keywordIndex = updatedKeywords.findIndex(k =>
  //       k.japaneseText.toLowerCase().includes(mapping.keyword.toLowerCase()) ||
  //       k.englishText.toLowerCase().includes(mapping.keyword.toLowerCase()) ||
  //       mapping.keyword.toLowerCase().includes(k.japaneseText.toLowerCase()) ||
  //       mapping.keyword.toLowerCase().includes(k.englishText.toLowerCase())
  //     );

  //     if (keywordIndex !== -1) {
  //       if (mapping.japaneseAudioUrl) {
  //         updatedKeywords[keywordIndex].japaneseAudioUrl = mapping.japaneseAudioUrl;
  //       }
  //       if (mapping.englishAudioUrl) {
  //         updatedKeywords[keywordIndex].englishAudioUrl = mapping.englishAudioUrl;
  //       }
  //       if (mapping.japaneseSentenceAudioUrl) {
  //         updatedKeywords[keywordIndex].japaneseSentenceAudioUrl = mapping.japaneseSentenceAudioUrl;
  //       }
  //     }
  //   });

  //   onApply(updatedKeywords);
  // };

  // Clear audio URL
  const clearAudioUrl = (keywordIndex: number, audioType: 'japanese' | 'english' | 'japaneseSentence') => {
    const updatedKeywords = [...keywords];
    switch (audioType) {
      case 'japanese':
        updatedKeywords[keywordIndex].japaneseAudioUrl = '';
        break;
      case 'english':
        updatedKeywords[keywordIndex].englishAudioUrl = '';
        break;
      case 'japaneseSentence':
        updatedKeywords[keywordIndex].japaneseSentenceAudioUrl = '';
        break;
    }
    onApply(updatedKeywords);
  };

  //   const handlePasteExample = () => {
  //     setBulkUrls(`konnichiwa_jp.mp3 https://s3.amazonaws.com/mybucket/audio/konnichiwa_jp.mp3
  // konnichiwa_en.mp3 https://s3.amazonaws.com/mybucket/audio/konnichiwa_en.mp3
  // konnichiwa_sentence_jp.mp3 https://s3.amazonaws.com/mybucket/audio/konnichiwa_sentence_jp.mp3
  // arigatou_jp.mp3 https://s3.amazonaws.com/mybucket/audio/arigatou_jp.mp3
  // arigatou_en.mp3 https://s3.amazonaws.com/mybucket/audio/arigatou_en.mp3
  // arigatou_sentence_jp.mp3 https://s3.amazonaws.com/mybucket/audio/arigatou_sentence_jp.mp3
  // sayonara_jp.mp3 https://s3.amazonaws.com/mybucket/audio/sayonara_jp.mp3
  // sayonara_en.mp3 https://s3.amazonaws.com/mybucket/audio/sayonara_en.mp3
  // sayonara_sentence_jp.mp3 https://s3.amazonaws.com/mybucket/audio/sayonara_sentence_jp.mp3`);
  //   };

  // Calculate completion statistics
  const getCompletionStats = () => {
    const totalKeywords = keywords.length;
    const keywordsWithBasicAudio = keywords.filter(k => k.japaneseAudioUrl && k.englishAudioUrl).length;
    const keywordsWithSentenceAudio = keywords.filter(k => k.japaneseSentenceAudioUrl).length;
    const keywordsWithAllAudio = keywords.filter(k =>
      k.japaneseAudioUrl && k.englishAudioUrl && k.japaneseSentenceAudioUrl
    ).length;

    return {
      totalKeywords,
      keywordsWithBasicAudio,
      keywordsWithSentenceAudio,
      keywordsWithAllAudio,
      basicAudioPercentage: (keywordsWithBasicAudio / totalKeywords) * 100,
      sentenceAudioPercentage: (keywordsWithSentenceAudio / totalKeywords) * 100,
      completeAudioPercentage: (keywordsWithAllAudio / totalKeywords) * 100,
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

            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Keyword</TableCell>
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
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell sx={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {keyword.japaneseText}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {keyword.englishText}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {keyword.japaneseSentence || '-'}
                      </TableCell>
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
                      <TableCell align="center">
                        {keyword.japaneseSentenceAudioUrl ? (
                          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                            <CheckCircle color="success" fontSize="small" />
                            <IconButton
                              size="small"
                              onClick={() => clearAudioUrl(index, 'japaneseSentence')}
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
                  Basic Audio: {stats.keywordsWithBasicAudio} / {stats.totalKeywords} keywords ({Math.round(stats.basicAudioPercentage) || 0}%)
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={stats.basicAudioPercentage}
                  color="primary"
                />

                <Typography variant="body2" color="text.secondary">
                  Sentence Audio: {stats.keywordsWithSentenceAudio} / {stats.totalKeywords} keywords ({Math.round(stats.sentenceAudioPercentage) || 0}%)
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={stats.sentenceAudioPercentage}
                  color="success"
                />

                <Typography variant="body2" color="text.secondary">
                  Complete Audio: {stats.keywordsWithAllAudio} / {stats.totalKeywords} keywords ({Math.round(stats.completeAudioPercentage) || 0}%)
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={stats.completeAudioPercentage}
                  color="secondary"
                />
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