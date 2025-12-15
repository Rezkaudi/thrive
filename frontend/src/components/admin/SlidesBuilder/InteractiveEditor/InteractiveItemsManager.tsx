import React from 'react';
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
  Paper,
  Box,
  IconButton,
  Tooltip,
  Chip,
  Alert,
} from '@mui/material';
import {
  Add,
  Delete,
  ContentCopy,
  DragIndicator,
  Preview,
  ExpandMore,
  Psychology,
  Refresh,
} from '@mui/icons-material';
import { InteractiveContent } from '../../../../types/interactive.types';
import { interactiveTypes } from '../../../../utils/interactiveTypes';
import { getDefaultInteractiveItem } from '../../../../utils/lideDefaults';
import { InteractiveItemEditor } from './InteractiveItemEditor';

interface InteractiveItemsManagerProps {
  interactiveContent: InteractiveContent;
  onUpdateContent: (updates: Partial<InteractiveContent>) => void;
  previewItem: number | null;
  onSetPreviewItem: (index: number | null) => void;
  slideSettings?: Record<string, any>;
  onSlideSettingsUpdate?: (settings: Record<string, any>) => void;
}

export const InteractiveItemsManager: React.FC<InteractiveItemsManagerProps> = ({
  interactiveContent,
  onUpdateContent,
  previewItem,
  onSetPreviewItem,
  slideSettings,
  onSlideSettingsUpdate,
}) => {
  const currentTypeConfig = interactiveTypes.find(t => t.value === interactiveContent.type);
  const isSentenceBuilder = interactiveContent.type === 'sentence-builder';

  // For sentence builder, ensure we have exactly one item
  React.useEffect(() => {
    if (isSentenceBuilder) {
      if (!interactiveContent.items || interactiveContent.items.length === 0) {
        // Initialize with one default item
        const defaultItem = getDefaultInteractiveItem(interactiveContent.type);
        onUpdateContent({ items: [defaultItem] });
      } else if (interactiveContent.items.length > 1) {
        // Keep only the first item
        onUpdateContent({ items: [interactiveContent.items[0]] });
      }
    }
  }, [isSentenceBuilder, interactiveContent.items, interactiveContent.type, onUpdateContent]);

  const addInteractiveItem = () => {
    if (isSentenceBuilder) return; // Don't allow adding items for sentence builder
    
    const currentItems = interactiveContent.items || [];
    const newItem = getDefaultInteractiveItem(interactiveContent.type, currentItems.length);
    onUpdateContent({
      items: [...currentItems, newItem]
    });
  };

  const updateInteractiveItem = (itemIndex: number, updates: any) => {
    const newItems = [...(interactiveContent.items || [])];
    newItems[itemIndex] = { ...newItems[itemIndex], ...updates };
    onUpdateContent({ items: newItems });
  };

  const removeInteractiveItem = (itemIndex: number) => {
    if (isSentenceBuilder) return; // Don't allow removing items for sentence builder
    
    const newItems = (interactiveContent.items || []).filter((_, i) => i !== itemIndex);
    onUpdateContent({ items: newItems });
  };

  const duplicateInteractiveItem = (itemIndex: number) => {
    if (isSentenceBuilder) return; // Don't allow duplicating items for sentence builder
    
    const item = interactiveContent.items[itemIndex];
    const duplicatedItem = { ...item, id: Date.now() + Math.random() };
    const newItems = [...interactiveContent.items];
    newItems.splice(itemIndex + 1, 0, duplicatedItem);
    onUpdateContent({ items: newItems });
  };

  const moveItem = (itemIndex: number, direction: 'up' | 'down') => {
    if (isSentenceBuilder) return; // Don't allow moving items for sentence builder
    
    const newItems = [...interactiveContent.items];
    const targetIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
    
    if (targetIndex >= 0 && targetIndex < newItems.length) {
      [newItems[itemIndex], newItems[targetIndex]] = [newItems[targetIndex], newItems[itemIndex]];
      onUpdateContent({ items: newItems });
    }
  };

  const resetSentenceItem = () => {
    if (!isSentenceBuilder) return;
    
    const newItem = getDefaultInteractiveItem(interactiveContent.type);
    onUpdateContent({ items: [newItem] });
  };

  const clearAllItems = () => {
    if (isSentenceBuilder) {
      resetSentenceItem();
    } else {
      onUpdateContent({ items: [] });
    }
  };

  // Get current items
  const items = interactiveContent.items || [];
  const hasItems = items.length > 0;

  return (
    <Card variant="outlined" sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isSentenceBuilder && <Psychology color="primary" />}
            {currentTypeConfig?.label} {isSentenceBuilder ? '' : `Items (${items.length})`}
          </Typography>
          {isSentenceBuilder && (
            <Typography variant="body2" color="text.secondary">
              Single sentence mode - build one interactive sentence
            </Typography>
          )}
        </Box>
        
        <Stack direction="row" spacing={1}>
          {isSentenceBuilder ? (
            <>
              <Button
                variant="outlined"
                startIcon={<Preview />}
                onClick={() => onSetPreviewItem(previewItem === 0 ? null : 0)}
                size="small"
                color={previewItem === 0 ? 'primary' : 'inherit'}
                sx={{ borderRadius: 2 }}
              >
                {previewItem === 0 ? 'Hide Preview' : 'Preview'}
              </Button>
              {hasItems && (
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={resetSentenceItem}
                  size="small"
                  sx={{ borderRadius: 2 }}
                >
                  Reset
                </Button>
              )}
            </>
          ) : (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={addInteractiveItem}
              size="small"
              sx={{ borderRadius: 2 }}
            >
              Add Item
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Special notice for sentence builder */}
      {isSentenceBuilder && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Sentence Builder Mode:</strong> This type uses exactly one sentence. 
            Focus on creating high-quality word ordering with proper translation.
          </Typography>
        </Alert>
      )}

      {/* Empty State */}
      {!hasItems ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 2 }}>
          <Box sx={{ mb: 2 }}>
            {currentTypeConfig?.icon}
          </Box>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            {isSentenceBuilder ? 'Create Your Sentence Builder' : 'No Items Added Yet'}
          </Typography>
          <Typography color="text.secondary" gutterBottom sx={{ mb: 3 }}>
            {isSentenceBuilder 
              ? 'Students will drag and drop words to build the correct sentence order.' 
              : `Click "Add Item" to get started with ${currentTypeConfig?.label}.`
            }
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
            {currentTypeConfig?.example}
          </Typography>
          {isSentenceBuilder && (
            <Button
              variant="contained"
              onClick={() => {
                const newItem = getDefaultInteractiveItem(interactiveContent.type);
                onUpdateContent({ items: [newItem] });
              }}
              size="large"
              sx={{ borderRadius: 2, px: 4 }}
            >
              Start Building Sentence
            </Button>
          )}
        </Paper>
      ) : (
        <Stack spacing={3}>
          {items.map((item: any, itemIndex: number) => (
            <Card 
              key={item.id || itemIndex} 
              variant="outlined" 
              sx={{
                border: '2px solid',
                borderColor: previewItem === itemIndex ? 'primary.main' : 'divider',
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: 2
                }
              }}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Chip
                    label={isSentenceBuilder ? 'Sentence Configuration' : `Item ${itemIndex + 1}`}
                    color="primary"
                    variant="outlined"
                    icon={isSentenceBuilder ? <Psychology /> : <DragIndicator />}
                  />
                  
                  {/* Action buttons - different for sentence builder */}
                  <Stack direction="row" spacing={1}>
                    {!isSentenceBuilder && (
                      <>
                        <Tooltip title="Move Up">
                          <IconButton
                            size="small"
                            onClick={() => moveItem(itemIndex, 'up')}
                            disabled={itemIndex === 0}
                          >
                            <Box sx={{ transform: 'rotate(180deg)' }}>
                              <ExpandMore fontSize="small" />
                            </Box>
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Move Down">
                          <IconButton
                            size="small"
                            onClick={() => moveItem(itemIndex, 'down')}
                            disabled={itemIndex === items.length - 1}
                          >
                            <ExpandMore fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    
                    <Tooltip title="Preview Item">
                      <IconButton
                        size="small"
                        onClick={() => onSetPreviewItem(previewItem === itemIndex ? null : itemIndex)}
                        color={previewItem === itemIndex ? 'primary' : 'default'}
                      >
                        <Preview fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    {!isSentenceBuilder && (
                      <>
                        <Tooltip title="Duplicate Item">
                          <IconButton
                            size="small"
                            onClick={() => duplicateInteractiveItem(itemIndex)}
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Item">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeInteractiveItem(itemIndex)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Stack>
                </Stack>

                <InteractiveItemEditor
                  type={interactiveContent.type}
                  item={item}
                  itemIndex={itemIndex}
                  onUpdate={updateInteractiveItem}
                  currentTypeConfig={currentTypeConfig}
                  slideSettings={slideSettings}
                  onSlideSettingsUpdate={onSlideSettingsUpdate}
                  allItems={interactiveContent.items}
                />

                {previewItem === itemIndex && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.50', borderRadius: 2, border: '1px solid', borderColor: 'primary.200' }}>
                    <Typography variant="subtitle2" fontWeight={600} color="primary.main" gutterBottom>
                      📱 Student Preview
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {isSentenceBuilder 
                        ? 'Students will see shuffled words and drag them to build the correct sentence order.'
                        : 'This is how students will see and interact with this item.'
                      }
                    </Typography>
                    
                    {/* Mini preview for sentence builder */}
                    {isSentenceBuilder && item.words && item.words.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          Available words:
                        </Typography>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {item.words.map((word: string, i: number) => (
                            <Chip
                              key={i}
                              label={word}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.75rem' }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Quick Actions - Different for sentence builder vs other types */}
      {hasItems && (
        <Card sx={{ p: 2, bgcolor: 'grey.50', mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Quick Actions</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {isSentenceBuilder ? (
              <>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={resetSentenceItem}
                  startIcon={<Refresh />}
                >
                  Reset Sentence
                </Button>
                {/* Quick Stats for sentence builder */}
                <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Words: <strong>{items[0]?.words?.length || 0}</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Translation: <strong>{items[0]?.translation ? '✓' : '✗'}</strong>
                  </Typography>
                </Box>
              </>
            ) : (
              <>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    // Add 3 more default items with proper indices
                    const newItems = [];
                    for (let i = 0; i < 3; i++) {
                      newItems.push(getDefaultInteractiveItem(interactiveContent.type, items.length + i));
                    }
                    onUpdateContent({
                      items: [...items, ...newItems]
                    });
                  }}
                >
                  Add 3 More Items
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={clearAllItems}
                  color="error"
                >
                  Clear All Items
                </Button>
              </>
            )}
          </Stack>
        </Card>
      )}

      {/* Tips section */}
      {isSentenceBuilder && hasItems && (
        <Card sx={{ p: 2, bgcolor: 'info.50', mt: 2, border: '1px solid', borderColor: 'info.200' }}>
          <Typography variant="subtitle2" gutterBottom color="info.dark" fontWeight={600}>
            💡 Sentence Builder Tips
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              • <strong>Minimum 2 words:</strong> Ensure students have enough words to create meaning
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • <strong>Clear translation:</strong> Help students understand the target meaning
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • <strong>Logical order:</strong> Arrange words in natural sentence structure
            </Typography>
          </Stack>
        </Card>
      )}
    </Card>
  );
};