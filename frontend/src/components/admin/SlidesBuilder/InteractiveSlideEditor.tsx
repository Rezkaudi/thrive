import React, { useState, memo, useCallback } from "react";
import { Box, Tabs, Tab, Stack, TextField, Badge } from "@mui/material";
import { Slide, SlideContent } from "../../../types/slide.types";
import { InteractiveContent } from "../../../types/interactive.types";
import {
  FeedbackSettings,
  InteractiveTypeSelector,
  ValidationAlerts,
  InteractiveItemsManager,
  InteractiveSettings,
  InteractivePreview,
} from "./InteractiveEditor";

interface InteractiveSlideEditorProps {
  slide: Slide;
  index: number;
  onUpdate: (index: number, updates: Partial<Slide>) => void;
  onUpdateContent: (
    index: number,
    contentUpdates: Partial<SlideContent>
  ) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const InteractiveSlideEditor: React.FC<InteractiveSlideEditorProps> =
  memo(({ slide, index, onUpdateContent }) => {
    const [tabValue, setTabValue] = useState(0);
    const [previewItem, setPreviewItem] = useState<number | null>(null);

    const interactiveContent = (slide.content
      .content as InteractiveContent) || {
      type: "drag-drop",
      instruction: "Complete the interactive activity",
      items: [],
      settings: {},
      feedback: {
        correct: "Excellent! You got it right! 🎉",
        incorrect: "Not quite right. Try again! 💪",
      },
    };

    const updateInteractiveContent = useCallback(
      (updates: Partial<InteractiveContent>) => {
        onUpdateContent(index, {
          content: {
            ...interactiveContent,
            ...updates,
          },
        });
      },
      [index, interactiveContent, onUpdateContent]
    );

    const updateSettings = useCallback(
      (newSettings: any) => {
        updateInteractiveContent({
          settings: { ...interactiveContent.settings, ...newSettings },
        });
      },
      [interactiveContent.settings, updateInteractiveContent]
    );

    const getValidationStatus = () => {
      const errors = [];
      const warnings = [];

      if (!interactiveContent.instruction?.trim()) {
        errors.push("Instructions are required");
      }

      if (!interactiveContent.items?.length) {
        errors.push("At least one interactive item is required");
      }

      if (
        interactiveContent.items?.length &&
        interactiveContent.items.length < 2
      ) {
        warnings.push("Consider adding more items for better engagement");
      }

      return { errors, warnings };
    };

    const { errors, warnings } = getValidationStatus();

    return (
      <Box>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="Type Selection" />
          <Tab
            label={
              <Badge badgeContent={errors.length} color="error">
                Content
              </Badge>
            }
          />
          <Tab label="Settings" />
          <Tab label="Preview" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <InteractiveTypeSelector
            interactiveContent={interactiveContent}
            onUpdateContent={updateInteractiveContent}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Stack spacing={3}>
            <ValidationAlerts errors={errors} warnings={warnings} />

            <TextField
              fullWidth
              label="Instructions"
              multiline
              rows={3}
              defaultValue={interactiveContent.instruction || ""}
              onBlur={(e) =>
                updateInteractiveContent({ instruction: e.target.value })
              }
              helperText="Clear instructions for students on what to do"
              error={!interactiveContent.instruction?.trim()}
            />

            <FeedbackSettings
              interactiveContent={interactiveContent}
              onUpdateContent={updateInteractiveContent}
            />

            <InteractiveItemsManager
              interactiveContent={interactiveContent}
              onUpdateContent={updateInteractiveContent}
              previewItem={previewItem}
              onSetPreviewItem={setPreviewItem}
            />
          </Stack>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <InteractiveSettings
            type={interactiveContent.type}
            settings={interactiveContent.settings || {}}
            onUpdate={updateSettings}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <InteractivePreview interactiveContent={interactiveContent} />
        </TabPanel>
      </Box>
    );
  });

InteractiveSlideEditor.displayName = "InteractiveSlideEditor";
