import { useState, useCallback, useMemo } from "react";
import { SlideComponentProps } from "../../types/slide.types";
import {
  Alert,
  Box,
  Button,
  Fade,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { CheckCircle, Image, TouchApp } from "@mui/icons-material";
import { HotspotItem } from "../../types/interactive-items.types";

export const HotspotSlide: React.FC<SlideComponentProps> = ({
  slide,
  showFeedback,
  validationResults,
  checkAnswer,
}) => {
  const [hotspotClicks, setHotspotClicks] = useState<Set<string>>(new Set());
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const content = slide.content.content;
  const slideId = `hotspot-${slide.id}`;
  const showSlideFeeback = showFeedback[slideId];
  const validation = validationResults[slideId];

  // Get hotspot items first
  const hotspotItems = useMemo(() => content.items || [], [content.items]);

  // Memoized values - get image URL from first hotspot or slide settings
  const imageUrl = useMemo(() => {
    // First, try to get from first hotspot's imageUrl
    const firstHotspotImage = hotspotItems?.[0]?.imageUrl;
    if (firstHotspotImage) return firstHotspotImage;
    
    // Then try slide-level settings
    if (content.settings?.imageUrl) return content.settings.imageUrl;
    
    // Finally try localStorage fallback
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hotspot-temp-image-url');
    }
    return null;
  }, [content.settings?.imageUrl, hotspotItems]);
  const totalHotspots = hotspotItems.length;
  const progressPercent = totalHotspots > 0 ? (hotspotClicks.size / totalHotspots) * 100 : 0;

  const hotspotSize = useMemo(() => {
    if (isMobile) return 32;
    if (isTablet) return 36;
    return 40;
  }, [isMobile, isTablet]);

  // Callbacks
  const handleHotspotClick = useCallback((hotspotId: string) => {
    setHotspotClicks((prev) => new Set(prev).add(hotspotId));
  }, []);

  const handleCheckAnswer = useCallback(() => {
    const correctHotspots = hotspotItems.map((item: HotspotItem) => item.id?.toString() || '');
    const clickedHotspots = Array.from(hotspotClicks);

    checkAnswer(
      slideId,
      clickedHotspots.sort(),
      correctHotspots.sort(),
      "hotspot"
    );
  }, [hotspotItems, hotspotClicks, slideId, checkAnswer]);

  const handleReset = useCallback(() => {
    setHotspotClicks(new Set());
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(false);
  }, []);

  return (
    <Box sx={{
      padding: { xs: 2, sm: 3, md: 4 },
      maxWidth: "1000px",
      margin: "0 auto",
      width: "100%"
    }}>
      <Typography
        variant={isMobile ? "h5" : "h4"}
        gutterBottom
        fontWeight={600}
        textAlign="center"
        sx={{
          mb: { xs: 2, md: 3 },
          fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" }
        }}
      >
        {slide.content.title}
      </Typography>

      <Typography
        variant="body1"
        sx={{
          textAlign: "center",
          mb: { xs: 3, md: 4 },
          color: "text.secondary",
          fontSize: { xs: "1rem", md: "1.1rem" },
          px: { xs: 1, sm: 2 }
        }}
      >
        {content.instruction}
      </Typography>

      {/* Image with Hotspots */}
      <Paper
        sx={{
          position: "relative",
          borderRadius: { xs: 2, md: 3 },
          overflow: "hidden",
          mb: { xs: 3, md: 4 },
          mx: { xs: 0, sm: 1 }
        }}
      >
        {imageUrl && !imageError ? (
          <Box sx={{ position: "relative", width: "100%" }}>
            {/* Loading state */}
            {!imageLoaded && (
              <Box
                sx={{
                  width: "100%",
                  height: { xs: "250px", sm: "300px", md: "400px" },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "grey.100",
                }}
              >
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}
                >
                  Loading image...
                </Typography>
              </Box>
            )}

            {/* Main image */}
            <Box
              component="img"
              src={imageUrl}
              alt="Interactive image"
              onLoad={handleImageLoad}
              onError={handleImageError}
              sx={{
                width: "100%",
                height: "auto",
                maxHeight: { xs: "400px", sm: "500px", md: "600px" },
                objectFit: "contain",
                display: imageLoaded ? "block" : "none",
              }}
            />

            {/* Hotspot Indicators - only show when image is loaded */}
            {imageLoaded && content.items?.map((item: HotspotItem, index: number) => {
              const itemId = item.id?.toString() || `hotspot-${index}`;
              const isClicked = hotspotClicks.has(itemId);
              
              return (
                <Tooltip
                  key={itemId}
                  title={isClicked ? item.feedback : item.label}
                  arrow
                  placement="top"
                  componentsProps={{
                    tooltip: {
                      sx: {
                        fontSize: { xs: "0.75rem", md: "0.875rem" },
                        maxWidth: { xs: 200, md: 300 }
                      }
                    }
                  }}
                >
                  <IconButton
                    onClick={() => handleHotspotClick(itemId)}
                    sx={{
                      position: "absolute",
                      left: `${Math.max(0, Math.min(100, item.x ?? 50))}%`,
                      top: `${Math.max(0, Math.min(100, item.y ?? 50))}%`,
                      transform: "translate(-50%, -50%)",
                      width: hotspotSize,
                      height: hotspotSize,
                      minWidth: hotspotSize,
                      minHeight: hotspotSize,
                      padding: 0,
                      bgcolor: isClicked ? "success.main" : "primary.main",
                      color: "white",
                      boxShadow: { xs: 2, md: 3 },
                      fontSize: { xs: "1rem", md: "1.25rem" },
                      animation:
                        content.settings?.showAllHotspots || isClicked
                          ? "none"
                          : "pulse 2s infinite",
                      "&:hover": {
                        bgcolor: isClicked ? "success.dark" : "primary.dark",
                        transform: "translate(-50%, -50%) scale(1.1)",
                      },
                      // Touch targets for mobile
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: -8,
                        left: -8,
                        right: -8,
                        bottom: -8,
                        display: { xs: "block", md: "none" }
                      },
                      "@keyframes pulse": {
                        "0%": { boxShadow: "0 0 0 0 rgba(25, 118, 210, 0.7)" },
                        "70%": { boxShadow: `0 0 0 ${isMobile ? 8 : 10}px rgba(25, 118, 210, 0)` },
                        "100%": { boxShadow: "0 0 0 0 rgba(25, 118, 210, 0)" },
                      },
                    }}
                  >
                    {isClicked ? (
                      <CheckCircle sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }} />
                    ) : (
                      <TouchApp sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }} />
                    )}
                  </IconButton>
                </Tooltip>
              );
            })}
          </Box>
        ) : (
          <Box sx={{
            p: { xs: 4, md: 8 },
            textAlign: "center",
            bgcolor: "grey.100"
          }}>
            <Image sx={{
              fontSize: { xs: 48, md: 64 },
              color: "text.secondary",
              mb: 2
            }} />
            <Typography
              variant={isMobile ? "body1" : "h6"}
              color="text.secondary"
              sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}
            >
              {imageError ? "Failed to load image" : "No background image provided"}
            </Typography>
            {imageError && imageUrl && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 1,
                  fontSize: { xs: "0.75rem", md: "0.875rem" },
                  wordBreak: "break-all"
                }}
              >
                Image URL: {imageUrl}
              </Typography>
            )}
          </Box>
        )}
      </Paper>

      {/* Progress Indicator */}
      <Paper sx={{
        p: { xs: 2, md: 3 },
        mb: { xs: 3, md: 4 },
        bgcolor: "info.50",
        borderRadius: { xs: 2, md: 3 }
      }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={{ xs: 2, sm: 0 }}
        >
          <Typography
            variant="body1"
            fontWeight={500}
            sx={{
              fontSize: { xs: "0.9rem", md: "1rem" },
              textAlign: { xs: "center", sm: "left" }
            }}
          >
            Progress: {hotspotClicks.size} of {totalHotspots} hotspots found
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{
              width: { xs: "100%", sm: 200 },
              height: { xs: 6, md: 8 },
              borderRadius: 4
            }}
          />
        </Stack>
      </Paper>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="center"
        alignItems="stretch"
      >
        <Button
          variant="outlined"
          size={isMobile ? "medium" : "large"}
          onClick={handleReset}
          sx={{
            px: { xs: 3, md: 4 },
            py: { xs: 1, md: 1.5 },
            fontSize: { xs: "0.9rem", md: "1rem" },
            borderRadius: { xs: 2, md: 3 },
            minHeight: { xs: 44, md: 48 }
          }}
        >
          🔄 Reset
        </Button>
        <Button
          variant="contained"
          size={isMobile ? "medium" : "large"}
          onClick={handleCheckAnswer}
          disabled={hotspotClicks.size !== totalHotspots}
          sx={{
            px: { xs: 4, md: 6 },
            py: { xs: 1, md: 1.5 },
            fontSize: { xs: "1rem", md: "1.1rem" },
            borderRadius: { xs: 2, md: 3 },
            minHeight: { xs: 44, md: 48 },
            background: "linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)",
            "&:hover": {
              background: "linear-gradient(45deg, #F57C00 30%, #FF9800 90%)",
            },
          }}
        >
          Check Hotspots ({hotspotClicks.size}/{totalHotspots})
        </Button>
      </Stack>

      {showSlideFeeback && validation && (
        <Fade in>
          <Alert
            severity={validation.type}
            sx={{
              mt: 3,
              borderRadius: { xs: 1, md: 2 },
              fontSize: { xs: "0.9rem", md: "1rem" },
              "& .MuiAlert-message": {
                width: "100%"
              }
            }}
          >
            {validation.message}
          </Alert>
        </Fade>
      )}
    </Box>
  );
};