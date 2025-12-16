import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  Alert,
} from "@mui/material";

interface PointsBalanceProps {
  totalPoints: number;
}

export const PointsBalance: React.FC<PointsBalanceProps> = ({
  totalPoints,
}) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Points Balance
        </Typography>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h3" fontWeight={700} color="primary">
              {totalPoints || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Available Points
            </Typography>
          </Box>
          <Alert severity="info">
            <Typography variant="body2">
              Earn points by completing lessons and participating in the
              community!
            </Typography>
          </Alert>
        </Stack>
      </CardContent>
    </Card>
  );
};
