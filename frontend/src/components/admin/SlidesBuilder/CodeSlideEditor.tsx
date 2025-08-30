import React, { useState } from 'react';
import {
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Grid,
  FormControlLabel,
  Switch,
  Box,
  Chip,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ContentCopy,
  PlayArrow,
  Code,
  Fullscreen,
  Download,
  Upload,
  Settings,
  Visibility,
  Edit,
  BugReport,
} from '@mui/icons-material';
import { Slide, SlideContent } from '../../../types/slide.types';

interface CodeSlideEditorProps {
  slide: Slide;
  index: number;
  onUpdate: (index: number, updates: Partial<Slide>) => void;
  onUpdateContent: (index: number, contentUpdates: Partial<SlideContent>) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export const CodeSlideEditor: React.FC<CodeSlideEditorProps> = ({
  slide,
  index,
  onUpdateContent,
}) => {
  const { content } = slide;
  const [tabValue, setTabValue] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const codeContent = content.content || {};
  const codeSettings = codeContent.settings || {};

  const updateCodeContent = (updates: any) => {
    onUpdateContent(index, {
      content: { ...codeContent, ...updates }
    });
  };

  const updateCodeSettings = (newSettings: any) => {
    updateCodeContent({
      settings: { ...codeSettings, ...newSettings }
    });
  };

  const languages = [
    { value: 'javascript', label: 'JavaScript', example: 'console.log("Hello, World!");' },
    { value: 'python', label: 'Python', example: 'print("Hello, World!")' },
    { value: 'java', label: 'Java', example: 'System.out.println("Hello, World!");' },
    { value: 'cpp', label: 'C++', example: '#include <iostream>\nstd::cout << "Hello, World!" << std::endl;' },
    { value: 'csharp', label: 'C#', example: 'Console.WriteLine("Hello, World!");' },
    { value: 'html', label: 'HTML', example: '<h1>Hello, World!</h1>' },
    { value: 'css', label: 'CSS', example: 'h1 { color: blue; }' },
    { value: 'sql', label: 'SQL', example: 'SELECT "Hello, World!";' },
    { value: 'json', label: 'JSON', example: '{\n  "message": "Hello, World!"\n}' },
    { value: 'typescript', label: 'TypeScript', example: 'const message: string = "Hello, World!";\nconsole.log(message);' },
    { value: 'php', label: 'PHP', example: '<?php echo "Hello, World!"; ?>' },
    { value: 'ruby', label: 'Ruby', example: 'puts "Hello, World!"' },
    { value: 'go', label: 'Go', example: 'fmt.Println("Hello, World!")' },
    { value: 'rust', label: 'Rust', example: 'println!("Hello, World!");' },
  ];

  const themes = [
    { value: 'vs-dark', label: 'Dark Theme', color: '#1e1e1e' },
    { value: 'vs-light', label: 'Light Theme', color: '#ffffff' },
    { value: 'github-dark', label: 'GitHub Dark', color: '#0d1117' },
    { value: 'monokai', label: 'Monokai', color: '#272822' },
    { value: 'dracula', label: 'Dracula', color: '#282a36' },
  ];

  const selectedLanguage = languages.find(lang => lang.value === (codeContent.language || 'javascript'));
  const selectedTheme = themes.find(theme => theme.value === (codeSettings.theme || 'vs-dark'));

  const handleRunCode = () => {
    setIsRunning(true);
    // Simulate code execution
    setTimeout(() => {
      setIsRunning(false);
    }, 2000);
  };

  return (
    <Stack spacing={3}>
      {/* Basic Code Info */}
      <TextField
        fullWidth
        label="Title"
        value={content.title || ''}
        onChange={(e) => onUpdateContent(index, { title: e.target.value })}
        placeholder="Code Example: Hello World"
      />

      <TextField
        fullWidth
        label="Description"
        value={content.subtitle || ''}
        onChange={(e) => onUpdateContent(index, { subtitle: e.target.value })}
        placeholder="Brief description of what this code demonstrates"
        multiline
        rows={2}
      />

      {/* Language Selection */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <InputLabel>Programming Language</InputLabel>
            <Select
              value={codeContent.language || 'javascript'}
              label="Programming Language"
              onChange={(e) => updateCodeContent({
                language: e.target.value,
                // Set example code if current code is empty or default
                ...((!codeContent.code || codeContent.code.includes('Enter your code here')) && {
                  code: languages.find(lang => lang.value === e.target.value)?.example || ''
                })
              })}
            >
              {languages.map((lang) => (
                <MenuItem key={lang.value} value={lang.value}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Code fontSize="small" />
                    <Typography>{lang.label}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <InputLabel>Code Theme</InputLabel>
            <Select
              value={codeSettings.theme || 'vs-dark'}
              label="Code Theme"
              onChange={(e) => updateCodeSettings({ theme: e.target.value })}
            >
              {themes.map((theme) => (
                <MenuItem key={theme.value} value={theme.value}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        bgcolor: theme.color,
                        borderRadius: 1,
                        border: '1px solid #ddd'
                      }}
                    />
                    <Typography>{theme.label}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Code Editor Tabs */}
      <Card variant="outlined">
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab
              label="Code Editor"
              icon={<Edit />}
              iconPosition="start"
            />
            <Tab
              label="Preview"
              icon={<Visibility />}
              iconPosition="start"
            />
            <Tab
              label="Settings"
              icon={<Settings />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Stack spacing={2}>
            {/* Code Editor Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={selectedLanguage?.label || 'JavaScript'}
                  color="primary"
                  size="small"
                />
                <Typography variant="body2" color="text.secondary">
                  {(codeContent.code || '').split('\n').length} lines
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1}>
                <Tooltip title="Copy Code">
                  <IconButton
                    size="small"
                    onClick={() => navigator.clipboard.writeText(codeContent.code || '')}
                  >
                    <ContentCopy />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Upload Code File">
                  <IconButton size="small">
                    <Upload />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download Code">
                  <IconButton size="small">
                    <Download />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Fullscreen Editor">
                  <IconButton size="small">
                    <Fullscreen />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>

            {/* Code Input */}
            <TextField
              fullWidth
              multiline
              rows={15}
              label="Code"
              value={codeContent.code || ''}
              onChange={(e) => updateCodeContent({ code: e.target.value })}
              error={!codeContent.code?.trim()}
              helperText={!codeContent.code?.trim() ? 'Code content is required' : `${selectedLanguage?.label} code`}
              sx={{
                '& .MuiInputBase-input': {
                  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", "Fira Code", Consolas, monospace',
                  fontSize: codeSettings.fontSize || '14px',
                  lineHeight: 1.5,
                  bgcolor: selectedTheme?.color,
                  color: selectedTheme?.value.includes('dark') ? '#ffffff' : '#000000',
                },
                '& .MuiOutlinedInput-root': {
                  bgcolor: selectedTheme?.color,
                }
              }}
              placeholder={selectedLanguage?.example || '// Enter your code here'}
            />
          </Stack>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Stack spacing={2}>
            {/* Preview Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Code Preview</Typography>
              <Stack direction="row" spacing={1}>
                {(selectedLanguage?.value === 'javascript' || selectedLanguage?.value === 'python') && (
                  <Button
                    variant="outlined"
                    startIcon={isRunning ? <BugReport /> : <PlayArrow />}
                    onClick={handleRunCode}
                    disabled={isRunning}
                    size="small"
                  >
                    {isRunning ? 'Running...' : 'Run Code'}
                  </Button>
                )}
                <Button
                  variant="outlined"
                  startIcon={<Fullscreen />}
                  size="small"
                >
                  Full Preview
                </Button>
              </Stack>
            </Stack>

            {/* Code Preview */}
            <Box
              sx={{
                bgcolor: selectedTheme?.color || '#1e1e1e',
                color: selectedTheme?.value.includes('dark') ? '#ffffff' : '#000000',
                p: 2,
                borderRadius: 1,
                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", "Fira Code", Consolas, monospace',
                fontSize: codeSettings.fontSize || '14px',
                lineHeight: 1.5,
                overflowX: 'auto',
                minHeight: 200,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {codeContent.code || '// No code to preview'}
              </pre>
            </Box>

            {/* Output Preview */}
            {isRunning ? (
              <Alert severity="info">
                <Typography variant="body2">Executing code...</Typography>
              </Alert>
            ) : (
              <Box
                sx={{
                  bgcolor: '#000000',
                  color: '#00ff00',
                  p: 2,
                  borderRadius: 1,
                  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                  fontSize: '13px',
                  minHeight: 60,
                  border: '1px solid #333',
                }}
              >
                <Typography variant="body2" sx={{ color: '#888', mb: 1 }}>
                  Output:
                </Typography>
                <pre style={{ margin: 0, color: '#00ff00' }}>
                  {selectedLanguage?.value === 'javascript' && codeContent.code?.includes('console.log') ?
                    'Hello, World!' :
                    selectedLanguage?.value === 'python' && codeContent.code?.includes('print') ?
                      'Hello, World!' :
                      'Click "Run Code" to see output'}
                </pre>
              </Box>
            )}
          </Stack>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Stack spacing={3}>
            <Typography variant="h6">Code Display Settings</Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Font Size"
                  value={codeSettings.fontSize || '14px'}
                  onChange={(e) => updateCodeSettings({ fontSize: e.target.value })}
                  placeholder="14px"
                  helperText="CSS font size (e.g., 14px, 1rem)"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Tab Size</InputLabel>
                  <Select
                    value={codeSettings.tabSize || 2}
                    label="Tab Size"
                    onChange={(e) => updateCodeSettings({ tabSize: e.target.value })}
                  >
                    <MenuItem value={2}>2 spaces</MenuItem>
                    <MenuItem value={4}>4 spaces</MenuItem>
                    <MenuItem value={8}>8 spaces</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={codeSettings.showLineNumbers !== false}
                      onChange={(e) => updateCodeSettings({ showLineNumbers: e.target.checked })}
                    />
                  }
                  label="Show line numbers"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={codeSettings.wordWrap || false}
                      onChange={(e) => updateCodeSettings({ wordWrap: e.target.checked })}
                    />
                  }
                  label="Word wrap"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={codeSettings.highlightActiveLines || false}
                      onChange={(e) => updateCodeSettings({ highlightActiveLines: e.target.checked })}
                    />
                  }
                  label="Highlight active lines"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={codeSettings.allowCopy !== false}
                      onChange={(e) => updateCodeSettings({ allowCopy: e.target.checked })}
                    />
                  }
                  label="Allow copying code"
                />
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mt: 3 }}>Interactive Features</Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={codeSettings.allowEditing || false}
                      onChange={(e) => updateCodeSettings({ allowEditing: e.target.checked })}
                    />
                  }
                  label="Allow students to edit code"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={codeSettings.allowExecution || false}
                      onChange={(e) => updateCodeSettings({ allowExecution: e.target.checked })}
                    />
                  }
                  label="Allow code execution"
                />
              </Grid>
            </Grid>

            {codeSettings.allowExecution && (
              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>Security Note:</strong> Code execution should only be enabled for trusted code.
                  Consider using sandboxed environments for student code execution.
                </Typography>
              </Alert>
            )}
          </Stack>
        </TabPanel>
      </Card>

      {/* Code Comments/Notes */}
      <TextField
        fullWidth
        multiline
        rows={3}
        label="Code Explanation / Comments"
        value={codeContent.explanation || ''}
        onChange={(e) => updateCodeContent({ explanation: e.target.value })}
        placeholder="Explain what this code does, key concepts, or provide additional context..."
        helperText="This explanation will be shown alongside the code to help students understand"
      />
    </Stack>
  );
};