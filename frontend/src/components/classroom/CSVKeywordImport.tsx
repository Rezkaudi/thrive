import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  CircularProgress,
} from '@mui/material';
import { Upload, Download, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';

interface CSVKeywordImportProps {
  onImport: (keywords: Array<{
    englishText: string;
    japaneseText: string;
    englishAudioUrl: string;
    japaneseAudioUrl: string;
    englishSentence?: string;
    japaneseSentence?: string;
    japaneseSentenceAudioUrl?: string;
  }>) => void;
}

export const CSVKeywordImport: React.FC<CSVKeywordImportProps> = ({ onImport }) => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const downloadTemplate = () => {
    const template = `Japanese,English,Japanese Audio URL,English Audio URL,Japanese Sentence,English Sentence,Japanese Sentence Audio URL
こんにちは,Hello,https://s3.../konnichiwa_jp.mp3,https://s3.../hello_en.mp3,こんにちは、元気ですか？,Hello! How are you?,https://s3.../konnichiwa_sentence_jp.mp3
ありがとう,Thank you,https://s3.../arigatou_jp.mp3,https://s3.../thankyou_en.mp3,本当にありがとうございます,Thank you very much,https://s3.../arigatou_sentence_jp.mp3
さようなら,Goodbye,https://s3.../sayonara_jp.mp3,https://s3.../goodbye_en.mp3,また明日会いましょう,See you tomorrow,https://s3.../sayonara_sentence_jp.mp3`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'keywords_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCSVRow = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add the last field
    result.push(current.trim());
    
    return result;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setPreview([]);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file must have a header row and at least one data row');
      }

      // Parse CSV headers
      const headers = parseCSVRow(lines[0]).map(h => h.trim());
      const expectedHeaders = [
        'Japanese', 
        'English', 
        'Japanese Audio URL', 
        'English Audio URL', 
        'Japanese Sentence', 
        'English Sentence', 
        'Japanese Sentence Audio URL'
      ];
      
      // Check if all required headers are present (case-insensitive)
      const missingHeaders = expectedHeaders.filter(expected => 
        !headers.some(h => h.toLowerCase() === expected.toLowerCase())
      );

      if (missingHeaders.length > 0) {
        throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
      }

      // Create header mapping for flexible column order
      const headerMap: { [key: string]: number } = {};
      expectedHeaders.forEach(expected => {
        const index = headers.findIndex(h => h.toLowerCase() === expected.toLowerCase());
        if (index !== -1) {
          headerMap[expected] = index;
        }
      });

      // Parse data rows
      const keywords = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = parseCSVRow(line);
        
        if (values.length < Math.max(...Object.values(headerMap)) + 1) {
          console.warn(`Skipping row ${i + 1}: insufficient columns`);
          continue;
        }

        const keyword = {
          japaneseText: values[headerMap['Japanese']] || '',
          englishText: values[headerMap['English']] || '',
          japaneseAudioUrl: values[headerMap['Japanese Audio URL']] || '',
          englishAudioUrl: values[headerMap['English Audio URL']] || '',
          japaneseSentence: values[headerMap['Japanese Sentence']] || '',
          englishSentence: values[headerMap['English Sentence']] || '',
          japaneseSentenceAudioUrl: values[headerMap['Japanese Sentence Audio URL']] || '',
        };

        // Validate required fields
        if (!keyword.japaneseText || !keyword.englishText) {
          console.warn(`Skipping row ${i + 1}: missing required text fields`);
          continue;
        }

        keywords.push(keyword);
      }

      if (keywords.length === 0) {
        throw new Error('No valid keywords found in CSV');
      }

      setPreview(keywords);
    } catch (err: any) {
      setError(err.message || 'Failed to parse CSV file');
    } finally {
      setLoading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleImport = () => {
    if (preview.length > 0) {
      onImport(preview);
      setPreview([]);
    }
  };

  return (
    <Box>
      <Stack spacing={3}>
        <Alert severity="info">
          Import keywords from a CSV file. The CSV should have columns for Japanese text, 
          English text, audio URLs for both languages, example sentences, and sentence audio URLs.
        </Alert>

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={downloadTemplate}
          >
            Download Template
          </Button>

          <Button
            component="label"
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <Upload />}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Upload CSV'}
            <input
              type="file"
              accept=".csv"
              hidden
              onChange={handleFileUpload}
            />
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {preview.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Preview ({preview.length} keywords)
            </Typography>
            
            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Japanese</TableCell>
                    <TableCell>English</TableCell>
                    <TableCell>Japanese Sentence</TableCell>
                    <TableCell>English Sentence</TableCell>
                    <TableCell align="center">JP Audio</TableCell>
                    <TableCell align="center">EN Audio</TableCell>
                    <TableCell align="center">JP Sentence Audio</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {preview.map((keyword, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {keyword.japaneseText}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {keyword.englishText}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {keyword.japaneseSentence || '-'}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {keyword.englishSentence || '-'}
                      </TableCell>
                      <TableCell align="center">
                        {keyword.japaneseAudioUrl ? (
                          <CheckCircle color="success" fontSize="small" />
                        ) : (
                          <ErrorIcon color="error" fontSize="small" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {keyword.englishAudioUrl ? (
                          <CheckCircle color="success" fontSize="small" />
                        ) : (
                          <ErrorIcon color="error" fontSize="small" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {keyword.japaneseSentenceAudioUrl ? (
                          <CheckCircle color="success" fontSize="small" />
                        ) : (
                          <ErrorIcon color="error" fontSize="small" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="success"
                onClick={handleImport}
                fullWidth
              >
                Import {preview.length} Keywords
              </Button>
              <Button
                variant="outlined"
                onClick={() => setPreview([])}
                fullWidth
              >
                Cancel
              </Button>
            </Stack>
          </Box>
        )}
      </Stack>
    </Box>
  );
};