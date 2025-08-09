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
} from '@mui/material';
import {
  Add,
  Delete,
  ContentCopy,
  DragIndicator,
  Preview,
  ExpandMore,
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
}

export const InteractiveItemsManager: React.FC<InteractiveItemsManagerProps> = ({
  interactiveContent,
  onUpdateContent,
  previewItem,
  onSetPreviewItem,
}) => {
  const currentTypeConfig = interactiveTypes.find(t => t.value === interactiveContent.type);

  const addInteractiveItem = () => {
    const newItem = getDefaultInteractiveItem(interactiveContent.type);
    onUpdateContent({
      items: [...(interactiveContent.items || []), newItem]
    });
  };

  const updateInteractiveItem = (itemIndex: number, updates: any) => {
    const newItems = [...(interactiveContent.items || [])];
    newItems[itemIndex] = { ...newItems[itemIndex], ...updates };
    onUpdateContent({ items: newItems });
  };

  const removeInteractiveItem = (itemIndex: number) => {
    const newItems = (interactiveContent.items || []).filter((_, i) => i !== itemIndex);
    onUpdateContent({ items: newItems });
  };

  const duplicateInteractiveItem = (itemIndex: number) => {
    const item = interactiveContent.items[itemIndex];
    const duplicatedItem = { ...item, id: Date.now() + Math.random() };
    const newItems = [...interactiveContent.items];
    newItems.splice(itemIndex + 1, 0, duplicatedItem);
    onUpdateContent({ items: newItems });
  };

  const moveItem = (itemIndex: number, direction: 'up' | 'down') => {
    const newItems = [...interactiveContent.items];
    const targetIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
    
    if (targetIndex >= 0 && targetIndex < newItems.length) {
      [newItems[itemIndex], newItems[targetIndex]] = [newItems[targetIndex], newItems[itemIndex]];
      onUpdateContent({ items: newItems });
    }
  };

  return (
    <Card variant="outlined" sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight={600}>
          {currentTypeConfig?.label} Items ({interactiveContent.items?.length || 0})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={addInteractiveItem}
          size="small"
          sx={{ borderRadius: 2 }}
        >
          Add Item
        </Button>
      </Stack>

      {(!interactiveContent.items || interactiveContent.items.length === 0) ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 2 }}>
          <Box sx={{ mb: 2 }}>
            {currentTypeConfig?.icon}
          </Box>
          <Typography color="text.secondary" gutterBottom>
            No items added yet. Click "Add Item" to get started.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {currentTypeConfig?.example}
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={3}>
          {interactiveContent.items.map((item: any, itemIndex: number) => (
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
                    label={`Item ${itemIndex + 1}`}
                    color="primary"
                    variant="outlined"
                    icon={<DragIndicator />}
                  />
                  <Stack direction="row" spacing={1}>
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
                        disabled={itemIndex === interactiveContent.items.length - 1}
                      >
                        <ExpandMore fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Preview Item">
                      <IconButton
                        size="small"
                        onClick={() => onSetPreviewItem(previewItem === itemIndex ? null : itemIndex)}
                        color={previewItem === itemIndex ? 'primary' : 'default'}
                      >
                        <Preview fontSize="small" />
                      </IconButton>
                    </Tooltip>
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
                  </Stack>
                </Stack>

                <InteractiveItemEditor
                  type={interactiveContent.type}
                  item={item}
                  itemIndex={itemIndex}
                  onUpdate={updateInteractiveItem}
                  currentTypeConfig={currentTypeConfig}
                />

                {previewItem === itemIndex && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight={600} color="primary.main">
                      📱 Item Preview: This is how students will see this item
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Quick Actions */}
      {interactiveContent.items && interactiveContent.items.length > 0 && (
        <Card sx={{ p: 2, bgcolor: 'grey.50', mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Quick Actions</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                // Add 3 more default items
                const newItems = [];
                for (let i = 0; i < 3; i++) {
                  newItems.push(getDefaultInteractiveItem(interactiveContent.type));
                }
                onUpdateContent({
                  items: [...interactiveContent.items, ...newItems]
                });
              }}
            >
              Add 3 More Items
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                onUpdateContent({ items: [] });
              }}
              color="error"
            >
              Clear All Items
            </Button>
          </Stack>
        </Card>
      )}
    </Card>
  );
};  