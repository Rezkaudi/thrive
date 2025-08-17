import React from 'react';
import {
  Card,
  CardContent,
  Grid,
  Avatar,
  Typography,
  Stack,
  Chip,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { InteractiveContent } from '../../../../types/interactive.types';
import { getDefaultInstruction, interactiveTypes } from '../../../../utils/interactiveTypes';


interface InteractiveTypeSelectorProps {
  interactiveContent: InteractiveContent;
  onUpdateContent: (updates: Partial<InteractiveContent>) => void;
}

export const InteractiveTypeSelector: React.FC<InteractiveTypeSelectorProps> = ({
  interactiveContent,
  onUpdateContent,
}) => {
  const currentType = interactiveContent.type || 'drag-drop';

  const handleTypeChange = (typeValue: string) => {
    // Show confirmation dialog
    const isConfirmed = window.confirm("Are you sure you want to change slide types?");

    // Only proceed if user confirms
    if (isConfirmed) {
      onUpdateContent({
        type: typeValue as any,
        items: [],
        settings: {},
        instruction: getDefaultInstruction(typeValue),
        feedback: {
          correct: 'Excellent! You got it right! 🎉',
          incorrect: 'Not quite right. Try again! 💪'
        }
      });
    }
  };
  return (
    <Card sx={{ mb: 3, border: '2px solid', borderColor: 'primary.main', borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
          Choose Interactive Type
        </Typography>

        <Grid container spacing={2}>
          {interactiveTypes.map((type) => {
            const isSelected = currentType === type.value;
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={type.value}>
                <Card
                  onClick={() => handleTypeChange(type.value)}
                  sx={{
                    cursor: 'pointer',
                    height: '100%',
                    border: '2px solid',
                    borderColor: isSelected ? type.color : 'transparent',
                    bgcolor: isSelected ? `${type.color}10` : 'background.paper',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    '&:hover': {
                      borderColor: type.color,
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 25px ${type.color}40`
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: type.color,
                        width: 56,
                        height: 56,
                        mx: 'auto',
                        mb: 2
                      }}
                    >
                      {type.icon}
                    </Avatar>

                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {type.label}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                      {type.description}
                    </Typography>

                    <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
                      <Chip
                        label={type.difficulty}
                        size="small"
                        sx={{
                          bgcolor: type.color + '20',
                          color: type.color,
                          fontWeight: 600
                        }}
                      />
                    </Stack>

                    <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                      {type.example}
                    </Typography>

                    {isSelected && (
                      <CheckCircle sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: type.color
                      }} />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
};