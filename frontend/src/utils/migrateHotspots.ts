// Types are used implicitly in JSDoc

interface MigrationResult {
  content: any;
  warnings: string[];
  stats: {
    hotspotsMigrated: number;
    imagesConsolidated: boolean;
  };
}

/**
 * Migrates hotspot content to the new format with centralized image management
 * @param content The original hotspot content to migrate
 * @returns Migration result with updated content and any warnings
 */
export const migrateHotspotContent = (content: any): MigrationResult => {
  const result: MigrationResult = {
    content: { ...content },
    warnings: [],
    stats: {
      hotspotsMigrated: 0,
      imagesConsolidated: false
    }
  };

  // Initialize settings if not present
  if (!result.content.settings) {
    result.content.settings = {};
  }

  // Collect all unique image URLs from hotspots
  const imageUrls = new Set<string>();
  
  // Process each hotspot
  if (Array.isArray(result.content.items)) {
    result.content.items = result.content.items.map((item: any) => {
      if (item.imageUrl) {
        imageUrls.add(item.imageUrl);
        
        // If this is the first hotspot with an image and no slide image is set yet
        if (!result.content.settings.imageUrl) {
          result.content.settings.imageUrl = item.imageUrl;
          result.stats.imagesConsolidated = true;
        }
        
        // Remove imageUrl from the hotspot
        const { imageUrl, ...rest } = item;
        result.stats.hotspotsMigrated++;
        return rest;
      }
      return item;
    });
  }

  // Add warnings if multiple images were found
  if (imageUrls.size > 1) {
    result.warnings.push(`Found ${imageUrls.size} different images across hotspots. Using first one as the slide image.`);
  }

  return result;
};

/**
 * Validates hotspot content for migration readiness
 * @param content The hotspot content to validate
 * @returns Object containing validation results
 */
export const validateHotspotContent = (content: any) => {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  if (!content) {
    errors.push('Content is undefined or null');
    return { isValid: false, errors, warnings };
  }

  // Check for hotspots with missing required fields
  if (Array.isArray(content.items)) {
    content.items.forEach((item: any, index: number) => {
      if (!item.id) {
        warnings.push(`Hotspot #${index + 1}: Missing ID, will be generated`);
      }
      if (item.imageUrl && !content.settings?.imageUrl) {
        warnings.push(`Hotspot #${index + 1}: Has individual image that will be moved to slide settings`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Batch migrates multiple slides
 * @param slides Array of slides to process
 * @returns Migration results for all slides
 */
export const batchMigrateHotspots = (slides: any[]) => {
  return slides.map(slide => {
    if (slide.content?.type === 'hotspot') {
      return migrateHotspotContent(slide.content);
    }
    return {
      content: slide.content,
      warnings: ['Not a hotspot slide, skipping migration'],
      stats: { hotspotsMigrated: 0, imagesConsolidated: false }
    };
  });
};

/**
 * Previews migration changes without applying them
 * @param content The content to analyze
 * @returns Preview of changes that would be made
 */
export const previewMigration = (content: any) => {
  const validation = validateHotspotContent(content);
  const migration = migrateHotspotContent(JSON.parse(JSON.stringify(content)));
  
  return {
    validation,
    changes: {
      oldImageUrls: collectImageUrls(content),
      newImageUrl: migration.content.settings?.imageUrl || null,
      hotspotsMigrated: migration.stats.hotspotsMigrated
    },
    warnings: migration.warnings
  };
};

// Helper function to collect all image URLs from hotspots
function collectImageUrls(content: any): string[] {
  const urls = new Set<string>();
  
  if (content?.items?.length) {
    content.items.forEach((item: any) => {
      if (item.imageUrl) {
        urls.add(item.imageUrl);
      }
    });
  }
  
  return Array.from(urls);
}

const hotspotMigrations = {
  migrateHotspotContent,
  validateHotspotContent,
  batchMigrateHotspots,
  previewMigration
};

export default hotspotMigrations;
