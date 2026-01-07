import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import {
  Stack,
  TextField,
  Grid,
  Box,
  Typography,
  Paper,
  Alert,
  IconButton,
  Button,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  CloudUpload,
  Image as ImageIcon,
  Close,
  GpsFixed,
  BugReport,
} from "@mui/icons-material";
import { HotspotItem } from "../../../../../types/interactive-items.types";

interface ImageBounds {
  // Container dimensions
  containerWidth: number;
  containerHeight: number;

  // Natural image dimensions
  naturalWidth: number;
  naturalHeight: number;

  // Rendered image dimensions (after object-fit: contain is applied)
  renderedWidth: number;
  renderedHeight: number;

  // Offset of the rendered image within the container
  offsetX: number;
  offsetY: number;

  // Aspect ratios
  naturalAspectRatio: number;
  containerAspectRatio: number;
}

interface HotspotEditorProps {
  item: HotspotItem;
  itemIndex: number;
  onUpdate: (updates: Partial<HotspotItem>) => void;
  currentTypeConfig?: { color?: string };
  slideSettings?: Record<string, any>;
  onSlideSettingsUpdate?: (settings: Record<string, any>) => void;
  allHotspots: HotspotItem[];
}

export const HotspotEditor: React.FC<HotspotEditorProps> = memo(
  ({
    item,
    itemIndex,
    onUpdate,
    currentTypeConfig,
    slideSettings,
    onSlideSettingsUpdate,
    allHotspots,
  }) => {
    const [imageLoadError, setImageLoadError] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [debugMode, setDebugMode] = useState(false);
    const [imageBounds, setImageBounds] = useState<ImageBounds | null>(null);
    const previewBoxRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const labelRef = useRef(item.label || "");
    const imageUrlInputRef = useRef(
      item.imageUrl || slideSettings?.imageUrl || ""
    );

    // Each hotspot can have its own image URL
    const imageUrl = item.imageUrl || slideSettings?.imageUrl;
    const canUpload = !!onSlideSettingsUpdate;

    const updateImageUrl = useCallback(
      (url: string) => {
        setImageLoadError(false);
        // Update the item with its own image URL
        onUpdate({ imageUrl: url });
      },
      [onUpdate]
    );

    const handleImageUpload = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
          setImageLoadError(true);
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          updateImageUrl(dataUrl);
        };
        reader.onerror = () => {
          setImageLoadError(true);
        };
        reader.readAsDataURL(file);
      },
      [updateImageUrl]
    );

    const handleImageUrlChange = useCallback(
      (url: string) => {
        updateImageUrl(url);
      },
      [updateImageUrl]
    );

    const handleClearImage = useCallback(() => {
      updateImageUrl("");
      setImageLoadError(false);
    }, [updateImageUrl]);

    // Calculate image bounds when image loads or container resizes
    const updateImageBounds = useCallback(() => {
      if (!imageRef.current || !previewBoxRef.current) return;

      const container = previewBoxRef.current;
      const img = imageRef.current;

      if (!img.naturalWidth || !img.naturalHeight) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;
      const naturalAspectRatio = naturalWidth / naturalHeight;
      const containerAspectRatio = containerWidth / containerHeight;

      let renderedWidth: number;
      let renderedHeight: number;
      let offsetX: number;
      let offsetY: number;

      if (naturalAspectRatio > containerAspectRatio) {
        // Image is wider than container - limited by width
        renderedWidth = containerWidth;
        renderedHeight = containerWidth / naturalAspectRatio;
        offsetX = 0;
        offsetY = (containerHeight - renderedHeight) / 2;
      } else {
        // Image is taller than container - limited by height
        renderedHeight = containerHeight;
        renderedWidth = containerHeight * naturalAspectRatio;
        offsetX = (containerWidth - renderedWidth) / 2;
        offsetY = 0;
      }

      setImageBounds({
        containerWidth,
        containerHeight,
        naturalWidth,
        naturalHeight,
        renderedWidth,
        renderedHeight,
        offsetX,
        offsetY,
        naturalAspectRatio,
        containerAspectRatio,
      });
    }, []);

    // Handle image load
    const handleImageLoad = useCallback(() => {
      updateImageBounds();
      setImageLoadError(false);
    }, [updateImageBounds]);

    // Handle window resize
    useEffect(() => {
      const handleResize = () => updateImageBounds();

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, [updateImageBounds]);

    // Dragging handlers for position preview
    const handleMouseDown = useCallback(() => {
      setIsDragging(true);
    }, []);

    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !previewBoxRef.current || !imageBounds) return;

        const rect = previewBoxRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Check if click is within image bounds
        const isInBounds =
          mouseX >= imageBounds.offsetX &&
          mouseX <= imageBounds.offsetX + imageBounds.renderedWidth &&
          mouseY >= imageBounds.offsetY &&
          mouseY <= imageBounds.offsetY + imageBounds.renderedHeight;

        if (!isInBounds) return;

        // Calculate position relative to image
        const imageX = mouseX - imageBounds.offsetX;
        const imageY = mouseY - imageBounds.offsetY;

        // Convert to percentage of actual image
        const xPercent = (imageX / imageBounds.renderedWidth) * 100;
        const yPercent = (imageY / imageBounds.renderedHeight) * 100;

        // Clamp to valid range
        const finalX = Math.max(0, Math.min(100, xPercent));
        const finalY = Math.max(0, Math.min(100, yPercent));

        onUpdate({
          x: Math.round(finalX * 10) / 10, // Round to 1 decimal place
          y: Math.round(finalY * 10) / 10,
        });
      },
      [isDragging, onUpdate, imageBounds]
    );

    const handleMouseUp = useCallback(() => {
      setIsDragging(false);
    }, []);

    // Set up mouse up listener when dragging
    useEffect(() => {
      if (isDragging) {
        document.addEventListener("mouseup", handleMouseUp);
        return () => document.removeEventListener("mouseup", handleMouseUp);
      }
    }, [isDragging, handleMouseUp]);

    return (
      <Stack spacing={3}>
        {/* Image Upload/URL Section */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Background Image
          </Typography>

          <Stack spacing={2}>
            {/* Image Upload Button */}
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUpload />}
              sx={{ alignSelf: "flex-start" }}
            >
              Upload Image
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageUpload}
              />
            </Button>

            {/* Image URL Input */}
            <TextField
              fullWidth
              label="Or enter Image URL"
              defaultValue={imageUrl}
              onChange={(e) => {
                imageUrlInputRef.current = e.target.value;
              }}
              onBlur={() => handleImageUrlChange(imageUrlInputRef.current)}
              placeholder="https://picsum.photos/800/600"
              helperText={
                canUpload
                  ? "Upload a file or enter an image URL"
                  : "Enter an image URL (settings will be saved temporarily)"
              }
            />

            {/* Error Alert */}
            {imageLoadError && (
              <Alert severity="error" onClose={() => setImageLoadError(false)}>
                Failed to load image. Please check the file type or URL.
              </Alert>
            )}

            {/* Image Preview */}
            {imageUrl && (
              <Paper sx={{ p: 2, bgcolor: "grey.50", position: "relative" }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Current Image:
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={handleClearImage}
                    title="Remove image"
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Stack>
                <Box
                  component="img"
                  src={imageUrl}
                  alt="Hotspot background"
                  sx={{
                    width: "100%",
                    maxWidth: 300,
                    height: "auto",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "grey.300",
                  }}
                  onError={() => {
                    setImageLoadError(true);
                  }}
                />
              </Paper>
            )}

            {!imageUrl && (
              <Paper sx={{ p: 3, textAlign: "center", bgcolor: "grey.50" }}>
                <ImageIcon
                  sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Upload an image or enter a URL to get started
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Try: https://picsum.photos/800/600 for testing
                </Typography>
              </Paper>
            )}
          </Stack>
        </Box>

        {/* Hotspot Configuration */}
        <Paper
          sx={{
            p: 2,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Hotspot Position & Content
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="X Position (%)"
                value={item.x ?? 50}
                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                onChange={(e) => {
                  const val = Math.max(
                    0,
                    Math.min(100, parseInt(e.target.value) || 0)
                  );
                  onUpdate({ x: val });
                }}
                inputProps={{ min: 0, max: 100, step: 1 }}
                helperText="Horizontal position (0-100%)"
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="Y Position (%)"
                value={item.y ?? 50}
                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                onChange={(e) => {
                  const val = Math.max(
                    0,
                    Math.min(100, parseInt(e.target.value) || 0)
                  );
                  onUpdate({ y: val });
                }}
                inputProps={{ min: 0, max: 100, step: 1 }}
                helperText="Vertical position (0-100%)"
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Label"
                defaultValue={item.label || ""}
                onChange={(e) => {
                  labelRef.current = e.target.value;
                }}
                onBlur={() => {
                  if (labelRef.current !== (item.label || "")) {
                    onUpdate({ label: labelRef.current });
                  }
                }}
                placeholder="e.g., 目 (eye)"
                helperText="Short label for the hotspot"
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={debugMode}
                      onChange={(e) => setDebugMode(e.target.checked)}
                    />
                  }
                  label={
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <BugReport
                        fontSize="small"
                        color={debugMode ? "primary" : "disabled"}
                      />
                      <Typography
                        variant="caption"
                        color={debugMode ? "primary" : "text.secondary"}
                      >
                        Debug
                      </Typography>
                    </Stack>
                  }
                  sx={{ m: 0 }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontStyle: "italic" }}
                >
                  {isDragging
                    ? "🖱️ Dragging..."
                    : "💡 Click or drag to set position"}
                </Typography>
              </Stack>
            </Grid>
          </Grid>

          <Box
            ref={previewBoxRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => isDragging && setIsDragging(false)}
            sx={{
              position: "relative",
              width: "100%",
              height: 400,
              bgcolor: "background.paper",
              borderRadius: 1,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
              cursor: isDragging ? "grabbing" : "crosshair",
              mt: 2,
            }}
          >
            {imageUrl && (
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Hotspot Background"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  pointerEvents: "none",
                }}
                onLoad={handleImageLoad}
                onError={() => setImageLoadError(true)}
              />
            )}

            {/* Hotspot Indicator - Draggable */}
            {imageBounds && (
              <Box
                sx={{
                  position: "absolute",
                  left: `${
                    imageBounds.offsetX +
                    (item.x ?? 50) * (imageBounds.renderedWidth / 100)
                  }px`,
                  top: `${
                    imageBounds.offsetY +
                    (item.y ?? 50) * (imageBounds.renderedHeight / 100)
                  }px`,
                  transform: "translate(-50%, -50%)",
                  width: 32,
                  height: 32,
                  bgcolor: currentTypeConfig?.color || "primary.main",
                  borderRadius: "50%",
                  border: "3px solid white",
                  boxShadow: isDragging
                    ? "0 0 0 4px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)"
                    : "0 0 0 2px rgba(0,0,0,0.2)",
                  transition: isDragging ? "none" : "all 0.2s ease",
                  cursor: isDragging ? "grabbing" : "grab",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                  "&:hover": {
                    transform: "translate(-50%, -50%) scale(1.15)",
                    boxShadow: "0 0 0 3px rgba(0,0,0,0.3)",
                  },
                  ...(isDragging && {
                    transform: "translate(-50%, -50%)",
                    boxShadow:
                      "0 0 0 4px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)",
                  }),
                }}
              >
                <GpsFixed sx={{ fontSize: 16, color: "white" }} />
              </Box>
            )}

            {/* Debug Overlays */}
            {debugMode && imageBounds && (
              <>
                {/* Container bounds - RED */}
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    border: "2px dashed red",
                    pointerEvents: "none",
                    zIndex: 20,
                  }}
                />

                {/* Image bounds - BLUE */}
                <Box
                  sx={{
                    position: "absolute",
                    left: `${imageBounds.offsetX}px`,
                    top: `${imageBounds.offsetY}px`,
                    width: `${imageBounds.renderedWidth}px`,
                    height: `${imageBounds.renderedHeight}px`,
                    border: "2px solid blue",
                    pointerEvents: "none",
                    zIndex: 21,
                  }}
                />

                {/* White space indicators */}
                {imageBounds.offsetX > 0 && (
                  <>
                    <Box
                      sx={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        width: `${imageBounds.offsetX}px`,
                        height: "100%",
                        bgcolor: "rgba(255, 255, 0, 0.1)",
                        pointerEvents: "none",
                        zIndex: 19,
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        right: 0,
                        top: 0,
                        width: `${imageBounds.offsetX}px`,
                        height: "100%",
                        bgcolor: "rgba(255, 255, 0, 0.1)",
                        pointerEvents: "none",
                        zIndex: 19,
                      }}
                    />
                  </>
                )}

                {imageBounds.offsetY > 0 && (
                  <>
                    <Box
                      sx={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        width: "100%",
                        height: `${imageBounds.offsetY}px`,
                        bgcolor: "rgba(255, 255, 0, 0.1)",
                        pointerEvents: "none",
                        zIndex: 19,
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        left: 0,
                        bottom: 0,
                        width: "100%",
                        height: `${imageBounds.offsetY}px`,
                        bgcolor: "rgba(255, 255, 0, 0.1)",
                        pointerEvents: "none",
                        zIndex: 19,
                      }}
                    />
                  </>
                )}

                {/* Debug info panel */}
                <Paper
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    p: 1,
                    bgcolor: "rgba(0, 0, 0, 0.8)",
                    color: "white",
                    fontFamily: "monospace",
                    fontSize: "11px",
                    zIndex: 22,
                  }}
                >
                  <div>
                    Container: {imageBounds.containerWidth} ×{" "}
                    {imageBounds.containerHeight}px
                  </div>
                  <div>
                    Image: {imageBounds.naturalWidth} ×{" "}
                    {imageBounds.naturalHeight}px
                  </div>
                  <div>
                    Rendered: {Math.round(imageBounds.renderedWidth)} ×{" "}
                    {Math.round(imageBounds.renderedHeight)}px
                  </div>
                  <div>
                    Offset: ({Math.round(imageBounds.offsetX)},{" "}
                    {Math.round(imageBounds.offsetY)})px
                  </div>
                  <div>
                    Position: ({item.x ?? 50}%, {item.y ?? 50}%)
                  </div>
                  <div style={{ color: "yellow" }}>
                    {imageBounds.offsetX > 0
                      ? `White space: Left/Right ${Math.round(
                          imageBounds.offsetX
                        )}px`
                      : imageBounds.offsetY > 0
                      ? `White space: Top/Bottom ${Math.round(
                          imageBounds.offsetY
                        )}px`
                      : "No white space"}
                  </div>
                </Paper>
              </>
            )}

            {/* Preview Area */}
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: 400,
                bgcolor: "background.paper",
                borderRadius: 1,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                cursor: isDragging ? "grabbing" : "crosshair",
              }}
            >
              {imageUrl && (
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Hotspot Background"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    pointerEvents: "none",
                  }}
                  onLoad={handleImageLoad}
                  onError={() => setImageLoadError(true)}
                />
              )}

              {/* Hotspot Indicator - Draggable */}
              {imageBounds && (
                <Box
                  sx={{
                    position: "absolute",
                    left: `${
                      imageBounds.offsetX +
                      (item.x ?? 50) * (imageBounds.renderedWidth / 100)
                    }px`,
                    top: `${
                      imageBounds.offsetY +
                      (item.y ?? 50) * (imageBounds.renderedHeight / 100)
                    }px`,
                    transform: "translate(-50%, -50%)",
                    width: 32,
                    height: 32,
                    bgcolor: currentTypeConfig?.color || "primary.main",
                    borderRadius: "50%",
                    border: "3px solid white",
                    boxShadow: isDragging
                      ? "0 0 0 4px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)"
                      : "0 0 0 2px rgba(0,0,0,0.2)",
                    transition: isDragging ? "none" : "all 0.2s ease",
                    cursor: isDragging ? "grabbing" : "grab",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10,
                    "&:hover": {
                      transform: "translate(-50%, -50%) scale(1.15)",
                      boxShadow: "0 0 0 3px rgba(0,0,0,0.3)",
                    },
                    ...(isDragging && {
                      transform: "translate(-50%, -50%)",
                      boxShadow:
                        "0 0 0 4px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)",
                    }),
                  }}
                >
                  <GpsFixed sx={{ fontSize: 16, color: "white" }} />
                </Box>
              )}

              {/* Debug Overlays */}
              {debugMode && imageBounds && (
                <>
                  {/* Container bounds - RED */}
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      border: "2px dashed red",
                      pointerEvents: "none",
                      zIndex: 20,
                    }}
                  />

                  {/* Image bounds - BLUE */}
                  <Box
                    sx={{
                      position: "absolute",
                      left: `${imageBounds.offsetX}px`,
                      top: `${imageBounds.offsetY}px`,
                      width: `${imageBounds.renderedWidth}px`,
                      height: `${imageBounds.renderedHeight}px`,
                      border: "2px solid blue",
                      pointerEvents: "none",
                      zIndex: 21,
                    }}
                  />

                  {/* White space indicators */}
                  {imageBounds.offsetX > 0 && (
                    <>
                      <Box
                        sx={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          width: `${imageBounds.offsetX}px`,
                          height: "100%",
                          bgcolor: "rgba(255, 255, 0, 0.1)",
                          pointerEvents: "none",
                          zIndex: 19,
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          right: 0,
                          top: 0,
                          width: `${imageBounds.offsetX}px`,
                          height: "100%",
                          bgcolor: "rgba(255, 255, 0, 0.1)",
                          pointerEvents: "none",
                          zIndex: 19,
                        }}
                      />
                    </>
                  )}

                  {imageBounds.offsetY > 0 && (
                    <>
                      <Box
                        sx={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          width: "100%",
                          height: `${imageBounds.offsetY}px`,
                          bgcolor: "rgba(255, 255, 0, 0.1)",
                          pointerEvents: "none",
                          zIndex: 19,
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          left: 0,
                          bottom: 0,
                          width: "100%",
                          height: `${imageBounds.offsetY}px`,
                          bgcolor: "rgba(255, 255, 0, 0.1)",
                          pointerEvents: "none",
                          zIndex: 19,
                        }}
                      />
                    </>
                  )}

                  {/* Debug info panel */}
                  <Paper
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      p: 1,
                      bgcolor: "rgba(0, 0, 0, 0.8)",
                      color: "white",
                      fontFamily: "monospace",
                      fontSize: "11px",
                      zIndex: 22,
                    }}
                  >
                    <div>
                      Container: {imageBounds.containerWidth} ×{" "}
                      {imageBounds.containerHeight}px
                    </div>
                    <div>
                      Image: {imageBounds.naturalWidth} ×{" "}
                      {imageBounds.naturalHeight}px
                    </div>
                    <div>
                      Rendered: {Math.round(imageBounds.renderedWidth)} ×{" "}
                      {Math.round(imageBounds.renderedHeight)}px
                    </div>
                    <div>
                      Offset: ({Math.round(imageBounds.offsetX)},{" "}
                      {Math.round(imageBounds.offsetY)})px
                    </div>
                    <div>
                      Position: ({item.x ?? 50}%, {item.y ?? 50}%)
                    </div>
                    <div style={{ color: "yellow" }}>
                      {imageBounds.offsetX > 0
                        ? `White space: Left/Right ${Math.round(
                            imageBounds.offsetX
                          )}px`
                        : imageBounds.offsetY > 0
                        ? `White space: Top/Bottom ${Math.round(
                            imageBounds.offsetY
                          )}px`
                        : "No white space"}
                    </div>
                  </Paper>
                </>
              )}

              {/* Coordinates Display */}
              <Paper
                sx={{
                  position: "absolute",
                  bottom: 12,
                  right: 12,
                  px: 2,
                  py: 1,
                  bgcolor: isDragging
                    ? "success.light"
                    : "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(4px)",
                  borderRadius: 1,
                  boxShadow: isDragging ? 2 : 1,
                  transition: "all 0.2s ease",
                  zIndex: 10,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: isDragging ? "success.dark" : "text.primary",
                      fontFamily: "monospace",
                    }}
                  >
                    X: {item.x ?? 50}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    •
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: isDragging ? "success.dark" : "text.primary",
                      fontFamily: "monospace",
                    }}
                  >
                    Y: {item.y ?? 50}%
                  </Typography>
                </Stack>
              </Paper>

              {/* Grid Lines */}
              {imageUrl && (
                <>
                  <Box
                    sx={{
                      position: "absolute",
                      left: "50%",
                      top: 0,
                      bottom: 0,
                      width: "1px",
                      bgcolor: "rgba(0,0,0,0.1)",
                      pointerEvents: "none",
                      zIndex: 1,
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: 0,
                      right: 0,
                      height: "1px",
                      bgcolor: "rgba(0,0,0,0.1)",
                      pointerEvents: "none",
                      zIndex: 1,
                    }}
                  />
                </>
              )}

              {!imageUrl && (
                <Stack
                  justifyContent="center"
                  alignItems="center"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    bgcolor: "rgba(255,255,255,0.8)",
                    zIndex: 5,
                  }}
                >
                  <ImageIcon
                    sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Upload an image to enable dragging
                  </Typography>
                </Stack>
              )}
            </Box>
          </Box>
        </Paper>
      </Stack>
    );
  }
);

HotspotEditor.displayName = "HotspotEditor";

export default HotspotEditor;
