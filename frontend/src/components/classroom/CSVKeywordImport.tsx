import React, { useMemo, useRef, useState } from "react";
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
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";
import {
  CloudDownload as DownloadIcon,
  CloudUpload as UploadIcon,
  CheckCircle,
  Error as ErrorIcon,
} from "@mui/icons-material";

export interface KeywordRow {
  englishText: string;
  japaneseText: string;
  englishAudioUrl: string;
  japaneseAudioUrl: string;
  englishSentence?: string;
  japaneseSentence?: string;
  japaneseSentenceAudioUrl?: string;
}

interface CSVKeywordImportProps {
  existing?: KeywordRow[];
  onImport: (keywords: KeywordRow[]) => void;
}

const REQUIRED_HEADERS = [
  "Japanese",
  "English",
  "Japanese Audio URL",
  "English Audio URL",
  "Japanese Sentence",
  "English Sentence",
  "Japanese Sentence Audio URL",
] as const;

type HeaderKey = typeof REQUIRED_HEADERS[number];

const TEMPLATE_CSV = `Japanese,English,Japanese Audio URL,English Audio URL,Japanese Sentence,English Sentence,Japanese Sentence Audio URL
こんにちは,Hello,https://s3.../konnichiwa_jp.mp3,https://s3.../hello_en.mp3,こんにちは、元気ですか？,Hello! How are you?,https://s3.../konnichiwa_sentence_jp.mp3
ありがとう,Thank you,https://s3.../arigatou_jp.mp3,https://s3.../thankyou_en.mp3,本当にありがとうございます,Thank you very much,https://s3.../arigatou_sentence_jp.mp3
さようなら,Goodbye,https://s3.../sayonara_jp.mp3,https://s3.../goodbye_en.mp3,また明日会いましょう,See you tomorrow,https://s3.../sayonara_sentence_jp.mp3`;

function stripBOM(s: string) {
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

function parseCSVRow(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur.trim());
  return out;
}

function normalizeStr(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function makeKey(jp: string, en: string) {
  return `${jp}__${en}`.toLowerCase();
}

export const CSVKeywordImport: React.FC<CSVKeywordImportProps> = ({ existing = [], onImport }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<KeywordRow[]>([]);
  const [skipped, setSkipped] = useState<number>(0);
  const [mode, setMode] = useState<"append" | "replace">("append");

  const existingKeySet = useMemo(() => {
    const s = new Set<string>();
    for (const k of existing) s.add(makeKey(k.japaneseText, k.englishText));
    return s;
  }, [existing]);

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "keywords_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePickFile = () => inputRef.current?.click();
  const onModeChange = (_: any, val: "append" | "replace" | null) => {
    if (val) setMode(val);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setPreview([]);
    setSkipped(0);

    try {
      const raw = await file.text();
      const text = stripBOM(raw);
      const rawLines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
      const lines = rawLines.map((l) => l.trim()).filter((l) => l.length > 0);
      if (lines.length < 2) throw new Error("CSV must include a header and at least one data row.");

      const headers = parseCSVRow(lines[0]).map((h) => h.trim());
      const headerMap: Record<HeaderKey, number> = {} as any;

      for (const need of REQUIRED_HEADERS) {
        const idx = headers.findIndex((h) => h.toLowerCase() === need.toLowerCase());
        if (idx < 0) throw new Error(`Missing required header: "${need}".`);
        headerMap[need] = idx;
      }

      const rows: KeywordRow[] = [];
      let skippedCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const cells = parseCSVRow(lines[i]);
        const hasAll = Math.max(...(Object.values(headerMap) as number[])) < cells.length;
        if (!hasAll) { skippedCount++; continue; }

        const japaneseText = normalizeStr(cells[headerMap["Japanese"]]);
        const englishText = normalizeStr(cells[headerMap["English"]]);
        const japaneseAudioUrl = normalizeStr(cells[headerMap["Japanese Audio URL"]]);
        const englishAudioUrl = normalizeStr(cells[headerMap["English Audio URL"]]);
        const japaneseSentence = normalizeStr(cells[headerMap["Japanese Sentence"]]);
        const englishSentence = normalizeStr(cells[headerMap["English Sentence"]]);
        const japaneseSentenceAudioUrl = normalizeStr(cells[headerMap["Japanese Sentence Audio URL"]]);

        if (!japaneseText || !englishText) { skippedCount++; continue; }

        rows.push({
          japaneseText,
          englishText,
          japaneseAudioUrl,
          englishAudioUrl,
          japaneseSentence,
          englishSentence,
          japaneseSentenceAudioUrl,
        });
      }

      if (rows.length === 0) throw new Error("No valid keyword rows were found in the CSV.");

      // de-duplicate inside file
      const seen = new Set<string>();
      const deduped: KeywordRow[] = [];
      for (const r of rows) {
        const key = makeKey(r.japaneseText, r.englishText);
        if (seen.has(key)) { skippedCount++; continue; }
        seen.add(key);
        deduped.push(r);
      }

      setSkipped(skippedCount);
      setPreview(deduped);
    } catch (e: any) {
      setError(e?.message || "Failed to parse CSV file.");
    } finally {
      setLoading(false);
      if (event.target) event.target.value = "";
    }
  };

  const handleImport = () => {
    if (preview.length === 0) return;
    const toImport =
      mode === "append"
        ? preview.filter((r) => !existingKeySet.has(makeKey(r.japaneseText, r.englishText)))
        : preview;
    onImport(toImport);
    setPreview([]);
  };

  return (
    <Box>
      <input ref={inputRef} type="file" accept=".csv" hidden onChange={handleFileUpload} />

      <Stack spacing={3}>
        <Alert severity="info">
          Import keywords from a CSV file. Required columns:{" "}
          <strong>{REQUIRED_HEADERS.join(", ")}</strong>.
        </Alert>

        <Stack direction="row" spacing={2} alignItems="center">
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={downloadTemplate}>
            Download Template
          </Button>

          <Button
            onClick={handlePickFile}
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <UploadIcon />}
            disabled={loading}
          >
            {loading ? "Processing..." : "Upload CSV"}
          </Button>

          <Tooltip title="Append adds only new items; Replace discards existing and uses only CSV rows.">
            <ToggleButtonGroup color="primary" value={mode} exclusive onChange={onModeChange} size="small">
              <ToggleButton value="append">Append</ToggleButton>
              <ToggleButton value="replace">Replace</ToggleButton>
            </ToggleButtonGroup>
          </Tooltip>
        </Stack>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {preview.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Preview ({preview.length} unique rows{skipped > 0 ? `; skipped ${skipped}` : ""})
            </Typography>

            <TableContainer component={Paper} sx={{ maxHeight: 420 }}>
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
                  {preview.map((row, idx) => (
                    <TableRow key={`${row.japaneseText}-${row.englishText}-${idx}`}>
                      <TableCell sx={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {row.japaneseText}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {row.englishText}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {row.japaneseSentence || "-"}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {row.englishSentence || "-"}
                      </TableCell>
                      <TableCell align="center">
                        {row.japaneseAudioUrl ? <CheckCircle color="success" fontSize="small" /> : <ErrorIcon color="error" fontSize="small" />}
                      </TableCell>
                      <TableCell align="center">
                        {row.englishAudioUrl ? <CheckCircle color="success" fontSize="small" /> : <ErrorIcon color="error" fontSize="small" />}
                      </TableCell>
                      <TableCell align="center">
                        {row.japaneseSentenceAudioUrl ? <CheckCircle color="success" fontSize="small" /> : <ErrorIcon color="error" fontSize="small" />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button variant="contained" color="success" onClick={handleImport} fullWidth>
                {mode === "append" ? "Append" : "Replace"} {preview.length} Keyword{preview.length > 1 ? "s" : ""}
              </Button>
              <Button variant="outlined" onClick={() => setPreview([])} fullWidth>
                Cancel
              </Button>
            </Stack>
          </Box>
        )}
      </Stack>
    </Box>
  );
};
