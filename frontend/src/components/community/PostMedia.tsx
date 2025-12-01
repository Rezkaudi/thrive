// frontend/src/components/community/PostMedia.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  CardMedia,
  IconButton,
  Dialog,
  Typography,
  Chip,
  Stack,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  PlayArrow,
  Fullscreen,
  Image as ImageIcon,
  Movie as MovieIcon,
  Close,
  Download,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

// --- Types & Helpers ---

interface PostMediaProps {
  mediaUrls: string[];
  maxDisplay?: number;
}

const getMediaType = (url: string): "image" | "video" => {
  const videoExtensions = [".mp4", ".mov", ".avi", ".mkv", ".webm", ".ogg"];
  const lowerUrl = url.toLowerCase();
  if (videoExtensions.some((ext) => lowerUrl.includes(ext))) return "video";
  return "image";
};

const formatFileName = (url: string): string => {
  try {
    return decodeURIComponent(url.split("/").pop()?.split("?")[0] || "Media");
  } catch {
    return "Media File";
  }
};

// --- Main Component ---

export const PostMedia: React.FC<PostMediaProps> = ({
  mediaUrls,
  maxDisplay = 4,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // --- Logic for Lightbox (moved before early return) ---

  const handlePreview = (index: number) => {
    setCurrentIndex(index);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setDirection(0);
  };

  const paginate = useCallback(
    (newDirection: number) => {
      setDirection(newDirection);
      setCurrentIndex((prev) => {
        let next = prev + newDirection;
        if (next < 0) next = mediaUrls.length - 1;
        if (next >= mediaUrls.length) next = 0;
        return next;
      });
    },
    [mediaUrls.length]
  );

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = mediaUrls[currentIndex];
    const link = document.createElement("a");
    link.href = url;
    link.download = formatFileName(url);
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (!previewOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") paginate(-1);
      if (e.key === "ArrowRight") paginate(1);
      if (e.key === "Escape") handleClosePreview();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewOpen, paginate]);

  if (!mediaUrls || mediaUrls.length === 0) return null;

  // --- Logic for Dynamic Grid Layout ---

  const displayCount = Math.min(mediaUrls.length, maxDisplay);
  const displayUrls = mediaUrls.slice(0, displayCount);
  const remainingCount = mediaUrls.length - maxDisplay;

  // Determines CSS Grid properties based on index and total count
  const getGridStyle = (index: number, total: number) => {
    // Single Item: Full width, dynamic height handled by img tag
    if (total === 1)
      return {
        gridColumn: "span 2",
        gridRow: "span 2",
        height: "auto",
        maxHeight: "600px",
      };

    // Two Items: Split vertically
    if (total === 2)
      return { gridColumn: "span 1", gridRow: "span 2", height: "300px" };

    // Three Items: First item big (left), others stacked (right)
    if (total === 3) {
      if (index === 0)
        return { gridColumn: "span 1", gridRow: "span 2", height: "400px" };
      return { gridColumn: "span 1", gridRow: "span 1", height: "196px" }; // 196 + 196 + gap(8) = 400
    }

    // Four+ Items: 2x2 Grid
    return { gridColumn: "span 1", gridRow: "span 1", height: "200px" };
  };

  return (
    <Box sx={{ mt: 2, width: "100%", overflow: "hidden" }}>
      {/* --- DYNAMIC GRID CONTAINER --- */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 1,
          width: "100%",
          // Force single column on very small screens if multiple images
          ...(isMobile &&
            mediaUrls.length > 1 && {
              gridTemplateColumns: "1fr",
            }),
        }}
      >
        {displayUrls.map((url, index) => {
          const mediaType = getMediaType(url);
          const isLastItem = index === displayCount - 1;
          const showMoreOverlay = isLastItem && remainingCount > 0;
          const gridStyle =
            isMobile && mediaUrls.length > 1
              ? { height: "250px" } // Mobile fallback height
              : getGridStyle(index, displayCount);

          return (
            <motion.div
              key={`${url}-${index}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              style={{
                position: "relative",
                width: "100%",
                ...gridStyle,
              }}
            >
              <Box
                onClick={() => handlePreview(index)}
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 2,
                  overflow: "hidden",
                  position: "relative",
                  cursor: "pointer",
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "black", // Background for non-square videos/images
                  transition: "filter 0.2s",
                  "&:hover": { filter: "brightness(0.9)" },
                }}
              >
                {mediaType === "image" ? (
                  <CardMedia
                    component="img"
                    image={url}
                    alt="content"
                    sx={{
                      width: "100%",
                      height: "100%",
                      // For single images, use contain to show full image, otherwise cover to fill grid
                      objectFit: displayCount === 1 ? "contain" : "cover",
                      maxHeight: displayCount === 1 ? "600px" : "none",
                      bgcolor:
                        theme.palette.mode === "dark" ? "grey.900" : "grey.100",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <video
                      src={url}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: displayCount === 1 ? "contain" : "cover",
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        zIndex: 2,
                        bgcolor: "rgba(0,0,0,0.5)",
                        borderRadius: "50%",
                        p: 1.5,
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      <PlayArrow sx={{ color: "white", fontSize: 32 }} />
                    </Box>
                  </Box>
                )}

                {/* Badges / Overlays */}
                <Box sx={{ position: "absolute", top: 8, left: 8, zIndex: 2 }}>
                  <Chip
                    icon={
                      mediaType === "image" ? (
                        <ImageIcon style={{ color: "white" }} />
                      ) : (
                        <MovieIcon style={{ color: "white" }} />
                      )
                    }
                    label={mediaType === "video" ? "VIDEO" : "IMG"}
                    size="small"
                    sx={{
                      bgcolor: "rgba(0,0,0,0.6)",
                      color: "white",
                      backdropFilter: "blur(4px)",
                      fontWeight: "bold",
                      height: 24,
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  />
                </Box>

                {/* +X More Overlay */}
                {showMoreOverlay && (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      bgcolor: "rgba(0, 0, 0, 0.7)",
                      backdropFilter: "blur(4px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 10,
                      transition: "background-color 0.2s",
                      "&:hover": { bgcolor: "rgba(0, 0, 0, 0.6)" },
                    }}
                  >
                    <Typography variant="h4" fontWeight={700} color="white">
                      +{remainingCount}
                    </Typography>
                  </Box>
                )}

                {/* Hover Expand Icon (only if not "More" overlay) */}
                {!showMoreOverlay && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      opacity: 0,
                      transition: "opacity 0.2s",
                      ".MuiBox-root:hover &": { opacity: 1 },
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: "rgba(0,0,0,0.6)",
                        borderRadius: "50%",
                        p: 0.5,
                        color: "white",
                        display: "flex",
                      }}
                    >
                      <Fullscreen fontSize="small" />
                    </Box>
                  </Box>
                )}
              </Box>
            </motion.div>
          );
        })}
      </Box>

      {/* --- FULLSCREEN LIGHTBOX --- */}
      <Dialog
        fullScreen
        open={previewOpen}
        onClose={handleClosePreview}
        PaperProps={{
          sx: {
            bgcolor: "black",
            backgroundImage: "none",
          },
        }}
      >
        {/* Floating Controls Overlay */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            p: 2,
            zIndex: 1300,
            display: "flex",
            justifyContent: "space-between",
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)",
            pointerEvents: "none", // Allow clicking through empty space
          }}
        >
          <Box
            sx={{
              pointerEvents: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              variant="body1"
              sx={{ color: "white", fontWeight: 600 }}
            >
              {currentIndex + 1} / {mediaUrls.length}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.7)" }}
            >
              {formatFileName(mediaUrls[currentIndex])}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} sx={{ pointerEvents: "auto" }}>
            <Tooltip title="Download">
              <IconButton
                onClick={handleDownload}
                sx={{
                  color: "white",
                  bgcolor: "rgba(255,255,255,0.1)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                }}
              >
                <Download />
              </IconButton>
            </Tooltip>
            <IconButton
              onClick={handleClosePreview}
              sx={{
                color: "white",
                bgcolor: "rgba(255,255,255,0.1)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
              }}
            >
              <Close />
            </IconButton>
          </Stack>
        </Box>

        {/* Slider Area */}
        <Box
          sx={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {mediaUrls.length > 1 && (
            <>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  paginate(-1);
                }}
                sx={{
                  position: "absolute",
                  left: 16,
                  zIndex: 1200,
                  color: "white",
                  bgcolor: "rgba(0,0,0,0.5)",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
                }}
              >
                <ChevronLeft fontSize="large" />
              </IconButton>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  paginate(1);
                }}
                sx={{
                  position: "absolute",
                  right: 16,
                  zIndex: 1200,
                  color: "white",
                  bgcolor: "rgba(0,0,0,0.5)",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
                }}
              >
                <ChevronRight fontSize="large" />
              </IconButton>
            </>
          )}

          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={{
                enter: (dir: number) => ({
                  x: dir > 0 ? 1000 : -1000,
                  opacity: 0,
                }),
                center: { zIndex: 1, x: 0, opacity: 1 },
                exit: (dir: number) => ({
                  zIndex: 0,
                  x: dir < 0 ? 1000 : -1000,
                  opacity: 0,
                }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: isMobile ? "0" : "40px",
              }}
            >
              {getMediaType(mediaUrls[currentIndex]) === "image" ? (
                <Box
                  component="img"
                  src={mediaUrls[currentIndex]}
                  alt="Preview"
                  sx={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <Box
                  component="video"
                  src={mediaUrls[currentIndex]}
                  controls
                  autoPlay
                  sx={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    outline: "none",
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </Box>
      </Dialog>
    </Box>
  );
};
