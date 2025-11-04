/**
 * Utility functions for consistent hotspot positioning between editor and student view
 * 
 * Core principles:
 * 1. Store coordinates as percentages (0-100) relative to the actual image dimensions
 * 2. Use object-fit: contain for consistent rendering
 * 3. Calculate positions based on actual image bounds within container
 */

/**
 * Represents the bounds of the rendered image within its container
 */
export interface ImageBounds {
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

/**
 * Represents a position in both percentage and pixel coordinates
 */
export interface HotspotPosition {
  // Percentage coordinates (0-100% of image dimensions)
  xPercent: number;
  yPercent: number;
  
  // Pixel position relative to container
  left: number;
  top: number;
  
  // Pixel position relative to image (natural dimensions)
  imageX: number;
  imageY: number;
}

/**
 * Calculate the actual rendered image bounds within its container
 * This accounts for object-fit: contain behavior
 */
export function calculateImageBounds(
  container: HTMLElement,
  naturalWidth: number,
  naturalHeight: number
): ImageBounds {
  if (!container || !naturalWidth || !naturalHeight) {
    throw new Error('Invalid container or image dimensions');
  }

  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  
  if (containerWidth === 0 || containerHeight === 0) {
    throw new Error('Container has zero width or height');
  }

  const naturalAspectRatio = naturalWidth / naturalHeight;
  const containerAspectRatio = containerWidth / containerHeight;

  let renderedWidth: number;
  let renderedHeight: number;
  let offsetX: number;
  let offsetY: number;

  // Calculate rendered dimensions and offsets based on aspect ratios
  if (naturalAspectRatio > containerAspectRatio) {
    // Image is wider than container (relative to height)
    // Image will be scaled to fit width, with vertical centering
    renderedWidth = containerWidth;
    renderedHeight = containerWidth / naturalAspectRatio;
    offsetX = 0;
    offsetY = (containerHeight - renderedHeight) / 2;
  } else {
    // Image is taller than container (relative to width)
    // Image will be scaled to fit height, with horizontal centering
    renderedHeight = containerHeight;
    renderedWidth = containerHeight * naturalAspectRatio;
    offsetX = (containerWidth - renderedWidth) / 2;
    offsetY = 0;
  }

  return {
    containerWidth,
    containerHeight,
    naturalWidth,
    naturalHeight,
    renderedWidth,
    renderedHeight,
    offsetX,
    offsetY,
    naturalAspectRatio,
    containerAspectRatio
  };
}

/**
 * Convert percentage coordinates to pixel position within the container
 */
export function percentToPixels(
  xPercent: number,
  yPercent: number,
  bounds: ImageBounds
): { left: number; top: number } {
  // Clamp percentages to 0-100 range
  const safeX = Math.max(0, Math.min(100, xPercent));
  const safeY = Math.max(0, Math.min(100, yPercent));
  
  // Convert percentage to image coordinates (0-100% of natural dimensions)
  const imageX = (safeX / 100) * bounds.naturalWidth;
  const imageY = (safeY / 100) * bounds.naturalHeight;
  
  // Convert image coordinates to container coordinates
  const scaleX = bounds.renderedWidth / bounds.naturalWidth;
  const scaleY = bounds.renderedHeight / bounds.naturalHeight;
  
  const left = bounds.offsetX + (imageX * scaleX);
  const top = bounds.offsetY + (imageY * scaleY);
  
  return { left, top };
}

/**
 * Convert container pixel coordinates to percentage coordinates relative to image
 */
export function pixelsToPercent(
  clientX: number,
  clientY: number,
  container: HTMLElement,
  bounds: ImageBounds
): { xPercent: number; yPercent: number } {
  const rect = container.getBoundingClientRect();
  
  // Get mouse position relative to container
  const containerX = clientX - rect.left;
  const containerY = clientY - rect.top;
  
  // Convert to image coordinates
  const scaleX = bounds.naturalWidth / bounds.renderedWidth;
  const scaleY = bounds.naturalHeight / bounds.renderedHeight;
  
  // Calculate position relative to image (not container)
  const imageX = (containerX - bounds.offsetX) * scaleX;
  const imageY = (containerY - bounds.offsetY) * scaleY;
  
  // Convert to percentages (0-100% of image dimensions)
  const xPercent = (imageX / bounds.naturalWidth) * 100;
  const yPercent = (imageY / bounds.naturalHeight) * 100;
  
  // Clamp to 0-100%
  return {
    xPercent: Math.max(0, Math.min(100, xPercent)),
    yPercent: Math.max(0, Math.min(100, yPercent))
  };
}

/**
 * Calculate hotspot position with all coordinate systems
 */
export function calculateHotspotPosition(
  xPercent: number,
  yPercent: number,
  bounds: ImageBounds
): HotspotPosition {
  const { left, top } = percentToPixels(xPercent, yPercent, bounds);
  const imageX = (xPercent / 100) * bounds.naturalWidth;
  const imageY = (yPercent / 100) * bounds.naturalHeight;
  
  return {
    xPercent,
    yPercent,
    left,
    top,
    imageX,
    imageY
  };
}

/**
 * Check if a position is within the image bounds
 */
export function isPositionValid(
  xPercent: number,
  yPercent: number
): boolean {
  return (
    xPercent >= 0 && 
    xPercent <= 100 && 
    yPercent >= 0 && 
    yPercent <= 100
  );
}

/**
 * Get the center position of the image
 */
export function getCenterPosition(): { x: number; y: number } {
  return { x: 50, y: 50 };
}

/**
 * Get default positions for multiple hotspots
 */
export function getDefaultPositions(count: number): Array<{x: number, y: number}> {
  const positions: Array<{x: number, y: number}> = [];
  const presets = [
    { x: 25, y: 25 },  // Top-left
    { x: 75, y: 25 },  // Top-right
    { x: 50, y: 50 },  // Center
    { x: 25, y: 75 },  // Bottom-left
    { x: 75, y: 75 }   // Bottom-right
  ];
  
  for (let i = 0; i < count; i++) {
    positions.push(presets[i % presets.length]);
  }
  
  return positions;
}

/**
 * Calculate the distance between two points in percentage
 */
export function calculateDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Snap a position to a grid
 */
export function snapToGrid(
  x: number,
  y: number,
  gridSize: number
): { x: number; y: number } {
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize
  };
}

const hotspotPositioning = {
  calculateImageBounds,
  percentToPixels,
  pixelsToPercent,
  calculateHotspotPosition,
  isPositionValid,
  getCenterPosition,
  getDefaultPositions,
  calculateDistance,
  snapToGrid
};

export default hotspotPositioning;
