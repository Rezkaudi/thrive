import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Stack,
  IconButton,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
} from "@mui/icons-material";
import { color, motion } from "framer-motion";

import { PasswordStrengthMeter, StepIndicator } from "../components/auth";
import { FormInput } from "../components/ui/FormInput";
import { useRegistration } from "../hooks/useRegistration";
import { AuthLayout } from "../components/layout/AuthLayout";
import { useRegistrationFlowData } from "../utils/registrationFlow";

export const RegistrationPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    onValidSubmit,
    errors,
    isValid,
    loading,
    serverError,
    setServerError,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    passwordStrength,
    passwordValue,
    effectivePlan,
  } = useRegistration();

  // Get dynamic step configuration based on flow type
  const { totalSteps, currentStepLabel } =
    useRegistrationFlowData("basic_info");

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ borderRadius: 3, boxShadow: 10, my: 4 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3, md: 5 } }}>
            <Box textAlign="center" m={4}>
              <Typography
                variant="h4"
                fontWeight={700}
                color="primary"
                gutterBottom
              >
                {/* If effectivePlan is null (because URL was invalid or missing), 
                   it correctly defaults to Free Trial here. 
                */}
                {`Sign up ${
                  effectivePlan
                    ? "for the " + effectivePlan + " plan"
                    : "for a free 14 day trial"
                } `}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Learn Japanese and start thriving in Japan with us
              </Typography>
            </Box>

            <StepIndicator
              currentStep={1}
              label={currentStepLabel}
              totalSteps={totalSteps}
            />

            {serverError && (
              <Alert
                severity="error"
                sx={{ mb: 3 }}
                onClose={() => setServerError("")}
              >
                {serverError}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onValidSubmit)} noValidate>
              <Stack spacing={3}>
                <FormInput
                  label="Your Name"
                  registration={register("name")}
                  error={errors.name}
                  icon={<Person color="action" />}
                  isRequired
                />
                <FormInput
                  label="Email"
                  type="email"
                  registration={register("email")}
                  error={errors.email}
                  icon={<Email color="action" />}
                  isRequired
                />
                <Box>
                  <FormInput
                    label="Create Password"
                    type={showPassword ? "text" : "password"}
                    registration={register("password")}
                    icon={<Lock color="action" />}
                    isRequired
                    endIcon={
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    }
                  />
                  {passwordValue && (
                    <PasswordStrengthMeter
                      passwordStrength={passwordStrength}
                    />
                  )}
                </Box>
                <FormInput
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  registration={register("confirmPassword")}
                  error={errors.confirmPassword}
                  icon={<Lock color="action" />}
                  isRequired
                  endIcon={
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  }
                />
                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox {...register("agreeToTerms")} color="primary" />
                    }
                    label={
                      <Typography variant="body2">
                        <span style={{ color: "red" }}>*</span> I agree to the{" "}
                        <Link
                          to="/privacy-policy"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#1976d2" }}
                        >
                          terms and conditions
                        </Link>
                        .
                      </Typography>
                    }
                  />
                  {errors.agreeToTerms && (
                    <Typography variant="caption" color="error" display="block">
                      {errors.agreeToTerms.message}
                    </Typography>
                  )}
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...register("marketingEmails")}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        I'd love to receive free Japanese learning tips, updates and special offers.
                      </Typography>
                    }
                  />
                </Box>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading || passwordStrength.score < 100 || !isValid}
                  sx={{ py: 1.5 }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Continue to Verification"
                  )}
                </Button>
              </Stack>
            </form>
            <Box textAlign="center" mt={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Already have an account?{" "}
                <Button component={Link} to="/login" color="primary">
                  Login here
                </Button>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </AuthLayout>
  );
};
