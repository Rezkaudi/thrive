import React from 'react';
import { Stack, Alert } from '@mui/material';
import { Warning, Info } from '@mui/icons-material';

interface ValidationAlertsProps {
  errors: string[];
  warnings: string[];
}

export const ValidationAlerts: React.FC<ValidationAlertsProps> = ({
  errors,
  warnings,
}) => {
  if (errors.length === 0 && warnings.length === 0) {
    return null;
  }

  return (
    <Stack spacing={1}>
      {errors.map((error, i) => (
        <Alert key={`error-${i}`} severity="error" icon={<Warning />}>
          {error}
        </Alert>
      ))}
      {warnings.map((warning, i) => (
        <Alert key={`warning-${i}`} severity="warning" icon={<Info />}>
          {warning}
        </Alert>
      ))}
    </Stack>
  );
};