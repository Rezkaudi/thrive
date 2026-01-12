import { Cancel, CheckCircle } from "@mui/icons-material";
import { Box, Chip, LinearProgress, Stack } from "@mui/material";
import { PasswordStrength } from "../../types/registration.types";

interface IPasswordStrengthMeterProps {
  passwordStrength: PasswordStrength;
}

export const PasswordStrengthMeter = ({
  passwordStrength,
}: IPasswordStrengthMeterProps) => {
  return (
    <Box sx={{ mt: 1 }}>
      <LinearProgress
        variant="determinate"
        value={passwordStrength.score}
        color={passwordStrength.color as any}
        sx={{ height: 6, borderRadius: 3 }}
      />
      <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
        {passwordStrength.feedback.map((item, index) => (
          <Chip
            key={index}
            label={item}
            size="small"
            icon={<Cancel />}
            color="error"
            variant="outlined"
          />
        ))}
        {passwordStrength.score === 100 && (
          <Chip
            label="Strong password"
            size="small"
            icon={<CheckCircle />}
            color="success"
            sx={{ color: "white" }}
          />
        )}
      </Stack>
    </Box>
  );
};
