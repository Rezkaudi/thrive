import React from 'react';
import { TextField } from '@mui/material';
import { 
  InteractiveItemEditorProps, 
  InteractiveItem,
  DragDropItem,
  FillBlanksItem,
  MatchingItem,
  SortingItem,
  HotspotItem,
  TimelineItem,
  FlashcardItem,
  PronunciationItem,
  ListeningItem,
  SentenceBuilderItem
} from '../../../../types/interactive-items.types';
import { DragDropEditor } from './editors/DragDropEditor';
import { FillBlanksEditor } from './editors/FillBlanksEditor';
import { MatchingEditor, SortingEditor, TimelineEditor } from './editors/SimpleEditors';
import { HotspotEditor } from './editors/HotspotEditor';
import { FlashcardEditor } from './editors/FlashcardEditor';
import { AudioEditor } from './editors/AudioEditor';
import { SentenceBuilderEditor } from './editors/SentenceBuilderEditor';

interface ExtendedInteractiveItemEditorProps extends InteractiveItemEditorProps {
  allItems?: InteractiveItem[];
}

export const InteractiveItemEditor: React.FC<ExtendedInteractiveItemEditorProps> = ({
  type,
  item,
  itemIndex,
  onUpdate,
  currentTypeConfig,
  slideSettings,
  onSlideSettingsUpdate,
  allItems = [],
}) => {
  // Wrapper function to handle updates with itemIndex
  const handleUpdate = (updates: Partial<InteractiveItem>) => {
    onUpdate(itemIndex, updates);
  };

  switch (type) {
    case 'drag-drop':
      return (
        <DragDropEditor 
          item={item as DragDropItem} 
          onUpdate={handleUpdate} 
        />
      );

    case 'fill-blanks':
      return (
        <FillBlanksEditor 
          item={item as FillBlanksItem} 
          onUpdate={handleUpdate} 
        />
      );

    case 'matching':
      return (
        <MatchingEditor 
          item={item as MatchingItem} 
          onUpdate={handleUpdate} 
        />
      );

    case 'sorting':
      return (
        <SortingEditor 
          item={item as SortingItem} 
          onUpdate={handleUpdate} 
        />
      );

    case 'hotspot':
      return (
        <HotspotEditor
          item={item as HotspotItem}
          itemIndex={itemIndex}
          onUpdate={handleUpdate}
          currentTypeConfig={currentTypeConfig}
          slideSettings={slideSettings}
          onSlideSettingsUpdate={onSlideSettingsUpdate}
          allHotspots={allItems as HotspotItem[]}
        />
      );

    case 'timeline':
      return (
        <TimelineEditor 
          item={item as TimelineItem} 
          onUpdate={handleUpdate} 
        />
      );

    case 'flashcard':
      return (
        <FlashcardEditor 
          item={item as FlashcardItem} 
          onUpdate={handleUpdate} 
        />
      );

    case 'pronunciation':
      return (
        <AudioEditor 
          item={item as PronunciationItem} 
          onUpdate={handleUpdate} 
          type="pronunciation" 
        />
      );

    case 'listening':
      return (
        <AudioEditor 
          item={item as ListeningItem} 
          onUpdate={handleUpdate} 
          type="listening" 
        />
      );

    case 'sentence-builder':
      return (
        <SentenceBuilderEditor 
          item={item as SentenceBuilderItem} 
          onUpdate={handleUpdate} 
        />
      );

    default:
      return (
        <TextField
          fullWidth
          label="Content"
          value={(item as any).text || ''}
          onChange={(e) => handleUpdate({ text: e.target.value } as any)}
        />
      );
  }
};