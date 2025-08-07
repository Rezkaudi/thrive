import React from 'react';
import {
  Alert,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import { Error } from '@mui/icons-material';

interface ValidationDisplayProps {
  errors: string[];
}

export const ValidationDisplay: React.FC<ValidationDisplayProps> = ({ errors }) => {
  if (errors.length === 0) return null;

  return (
    <Alert severity="error" sx={{ borderRadius: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Please fix the following issues:
      </Typography>
      <List dense>
        {errors.map((error, i) => (
          <ListItem key={i}>
            <ListItemIcon>
              <Error color="error" />
            </ListItemIcon>
            <ListItemText primary={error} />
          </ListItem>
        ))}
      </List>
    </Alert>
  );
};