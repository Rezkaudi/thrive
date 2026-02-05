import { Box, Stack, Typography } from "@mui/material";

interface IStepIndicatorProps {
  currentStep: number;
  label: string;
  /** Total number of steps in the registration flow. Defaults to 3 for backward compatibility. */
  totalSteps?: number;
}

export const StepIndicator = ({
  currentStep,
  label,
  totalSteps = 3,
}: IStepIndicatorProps) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Stack direction="row" spacing={2} justifyContent="center">
        {[...Array(totalSteps)].map((_, index) => (
          <Box
            key={index}
            sx={{
              width: 40,
              height: 4,
              // Change color based on if step is active
              bgcolor: currentStep === index + 1 ? "primary.main" : "grey.300",
              borderRadius: 2,
              transition: "background-color 0.3s ease", // Smooth transition
            }}
          />
        ))}
      </Stack>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", textAlign: "center", mt: 1 }}
      >
        Step {currentStep} of {totalSteps}: {label}
      </Typography>
    </Box>
  );
};
