// frontend/src/components/classroom/SimplePDFViewer.tsx
import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    IconButton,
    Typography,
    Stack,
    CircularProgress,
    TextField,
    useMediaQuery,
    useTheme,
    Tooltip,
    Alert,
} from '@mui/material';
import {
    ZoomIn,
    ZoomOut,
    NavigateBefore,
    NavigateNext,
    FirstPage,
    LastPage,
    Download,
    Fullscreen,
    FullscreenExit,
} from '@mui/icons-material';

import { Document, Page, pdfjs } from 'react-pdf';

// Configure PDF.js worker for CRA/Webpack 5
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
    url: string;
    title?: string;
    allowDownload?: boolean;
}

export const SimplePDFViewer: React.FC<PDFViewerProps> = ({
    url,
    title = 'PDF Document',
    allowDownload = true
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(isMobile ? 0.6 : isTablet ? 0.8 : 1.0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [inputPageNumber, setInputPageNumber] = useState('1');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setIsLoading(false);
        setError(null);
    };

    const onDocumentLoadError = (error: Error) => {
        console.error('Error loading PDF:', error);
        setError('Failed to load PDF. Please try again later.');
        setIsLoading(false);
    };

    const changePage = (offset: number) => {
        setPageNumber((prevPageNumber) => {
            const newPageNumber = prevPageNumber + offset;
            const validPageNumber = Math.min(Math.max(1, newPageNumber), numPages || 1);
            setInputPageNumber(String(validPageNumber));
            return validPageNumber;
        });
    };

    const goToPage = (page: number) => {
        const validPageNumber = Math.min(Math.max(1, page), numPages || 1);
        setPageNumber(validPageNumber);
        setInputPageNumber(String(validPageNumber));
    };

    const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputPageNumber(e.target.value);
    };

    const handlePageInputSubmit = () => {
        const page = parseInt(inputPageNumber, 10);
        if (!isNaN(page)) {
            goToPage(page);
        }
    };

    const handleZoomIn = () => {
        setScale((prevScale) => Math.min(prevScale + 0.2, 3));
    };

    const handleZoomOut = () => {
        setScale((prevScale) => Math.max(prevScale - 0.2, 0.4));
    };

    // In frontend/src/components/classroom/SimplePDFViewer.tsx

    // Add this useEffect to listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            // Update state when fullscreen mode changes (e.g., when ESC is pressed)
            setIsFullscreen(!!document.fullscreenElement);
        };

        // Listen for fullscreen change events
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    // Update the toggleFullscreen function
    const toggleFullscreen = () => {
        const element = document.getElementById('pdf-viewer-container');
        if (!element) return;

        if (!isFullscreen) {
            // Entering fullscreen
            if (element.requestFullscreen) {
                element.requestFullscreen().catch((err) => {
                    console.error('Error entering fullscreen:', err);
                });
            }
            setIsFullscreen(true);
        } else {
            // Exiting fullscreen
            if (document.exitFullscreen && document.fullscreenElement) {
                document.exitFullscreen().catch((err) => {
                    // Silently catch the error if document is not active
                    console.log('Exit fullscreen error (likely already exited):', err);
                });
            }
            setIsFullscreen(false);
        }
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = url;
        link.download = title;
        link.click();
    };

    return (
        <Paper
            id="pdf-viewer-container"
            elevation={3}
            sx={{
                position: 'relative',
                height: isFullscreen ? '100vh' : '80vh',
                bgcolor: 'grey.100',
                borderRadius: isFullscreen ? 0 : 3,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Toolbar */}
            <Paper
                elevation={1}
                sx={{
                    p: 1,
                    borderRadius: 0,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    flexWrap="wrap"
                    gap={1}
                >
                    {/* Page Navigation */}
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Tooltip title="First page">
                            <IconButton
                                onClick={() => goToPage(1)}
                                disabled={pageNumber <= 1}
                                size="small"
                            >
                                <FirstPage />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Previous page">
                            <IconButton
                                onClick={() => changePage(-1)}
                                disabled={pageNumber <= 1}
                                size="small"
                            >
                                <NavigateBefore />
                            </IconButton>
                        </Tooltip>

                        <Stack direction="row" alignItems="center" spacing={1}>
                            <TextField
                                value={inputPageNumber}
                                onChange={handlePageInputChange}
                                onBlur={handlePageInputSubmit}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handlePageInputSubmit();
                                    }
                                }}
                                size="small"
                                sx={{
                                    width: 60,
                                    '& .MuiInputBase-input': {
                                        textAlign: 'center',
                                        py: 0.5,
                                    },
                                }}
                            />
                            <Typography variant="body2" color="text.secondary">
                                of {numPages || '-'}
                            </Typography>
                        </Stack>

                        <Tooltip title="Next page">
                            <IconButton
                                onClick={() => changePage(1)}
                                disabled={pageNumber >= (numPages || 1)}
                                size="small"
                            >
                                <NavigateNext />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Last page">
                            <IconButton
                                onClick={() => goToPage(numPages || 1)}
                                disabled={pageNumber >= (numPages || 1)}
                                size="small"
                            >
                                <LastPage />
                            </IconButton>
                        </Tooltip>
                    </Stack>

                    {/* Zoom Controls */}
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Tooltip title="Zoom out">
                            <IconButton onClick={handleZoomOut} size="small">
                                <ZoomOut />
                            </IconButton>
                        </Tooltip>

                        <Typography variant="body2" sx={{ minWidth: 60, textAlign: 'center' }}>
                            {Math.round(scale * 100)}%
                        </Typography>

                        <Tooltip title="Zoom in">
                            <IconButton onClick={handleZoomIn} size="small">
                                <ZoomIn />
                            </IconButton>
                        </Tooltip>
                    </Stack>

                    {/* Actions */}
                    <Stack direction="row" spacing={1}>
                        {allowDownload && (
                            <Tooltip title="Download PDF">
                                <IconButton onClick={handleDownload} size="small">
                                    <Download />
                                </IconButton>
                            </Tooltip>
                        )}

                        {!isMobile && (
                            <Tooltip title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
                                <IconButton onClick={toggleFullscreen} size="small">
                                    {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                                </IconButton>
                            </Tooltip>
                        )}
                    </Stack>
                </Stack>
            </Paper>

            {/* PDF Content */}
            <Box
                sx={{
                    flexGrow: 1,
                    overflow: 'auto',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    p: 2,
                    bgcolor: 'grey.200',
                }}
            >
                {error ? (
                    <Alert severity="error" sx={{ maxWidth: 500 }}>
                        {error}
                    </Alert>
                ) : (
                    <Document
                        file={url}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <CircularProgress />
                                <Typography>Loading PDF...</Typography>
                            </Box>
                        }
                    >
                        <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            loading={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <CircularProgress size={24} />
                                    <Typography variant="body2">Loading page...</Typography>
                                </Box>
                            }
                        />
                    </Document>
                )}
            </Box>

            {/* Mobile-friendly floating controls */}
            {isMobile && !error && (
                <Paper
                    elevation={4}
                    sx={{
                        position: 'absolute',
                        bottom: 16,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        p: 1,
                        borderRadius: 4,
                        bgcolor: 'background.paper',
                        opacity: 0.95,
                    }}
                >
                    <Stack direction="row" spacing={1}>
                        <IconButton
                            onClick={() => changePage(-1)}
                            disabled={pageNumber <= 1}
                            size="small"
                        >
                            <NavigateBefore />
                        </IconButton>

                        <Box sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
                            <Typography variant="body2">
                                {pageNumber} / {numPages || '-'}
                            </Typography>
                        </Box>

                        <IconButton
                            onClick={() => changePage(1)}
                            disabled={pageNumber >= (numPages || 1)}
                            size="small"
                        >
                            <NavigateNext />
                        </IconButton>
                    </Stack>
                </Paper>
            )}
        </Paper>
    );
};