import React from 'react';
import { LinearProgress } from '@mui/material';

interface ProgressBarProps {
  progress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <LinearProgress
      variant="determinate"
      value={progress}
      sx={{
        height: 8,
        '& .MuiLinearProgress-bar': {
          background: 'linear-gradient(90deg, #5C633A 0%, #A6531C 100%)'
        }
      }}
    />
  );
};