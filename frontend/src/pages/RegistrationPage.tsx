import { Link } from "react-router-dom";
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Stack,
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
import { motion } from "framer-motion";
import { PasswordStrengthMeter, StepIndicator } from "../components/auth";
import { useRegistration } from "../hooks/useRegistration";

export const RegistrationPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    setShowPassword,
    setShowConfirmPassword,
    onSubmit,
    setServerError,
    errors,
    isValid,
    showPassword,
    showConfirmPassword,
    loading,
    serverError,
    passwordStrength,
    passwordValue,
  } = useRegistration();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: "linear-gradient(135deg, #5C633A 0%, #D4BC8C 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: "absolute",
          top: -200,
          right: -200,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.1)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -300,
          left: -300,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.05)",
        }}
      />

      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
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
                  Sign up for a free 14 day trial
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Learn Japanese and start thriving in Japan with us
                </Typography>
              </Box>

              {/* Progress Indicator */}
              <StepIndicator currentStep={1} label="Account Information" />

              {serverError && (
                <Alert
                  severity="error"
                  sx={{ mb: 3 }}
                  onClose={() => setServerError("")}
                >
                  {serverError}
                </Alert>
              )}

              {/* Note: We pass the handleSubmit from RHF here */}
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Your Name"
                    {...register("name")}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    {...register("email")}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Box>
                    <TextField
                      fullWidth
                      type={showPassword ? "text" : "password"}
                      label="Create Password"
                      {...register("password")}
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    {/* Only show strength meter if user has typed something */}
                    {passwordValue && (
                      <PasswordStrengthMeter
                        passwordStrength={passwordStrength}
                      />
                    )}
                  </Box>

                  <TextField
                    fullWidth
                    type={showConfirmPassword ? "text" : "password"}
                    label="Confirm Password"
                    {...register("confirmPassword")}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            edge="end"
                          >
                            {showConfirmPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <FormControlLabel
                    control={
                      <Checkbox {...register("agreeToTerms")} color="primary" />
                    }
                    label={
                      <Typography variant="body2">
                        I agree to the{" "}
                        <Link
                          to="/privacy-policy"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#1976d2", textDecoration: "none" }}
                        >
                          terms and conditions
                        </Link>
                      </Typography>
                    }
                    sx={{ mt: 2 }}
                  />
                  {errors.agreeToTerms && (
                    <Typography variant="caption" color="error">
                      {errors.agreeToTerms.message}
                    </Typography>
                  )}

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={
                      loading || passwordStrength.score < 100 || !isValid
                    }
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
                  Already have an account?
                </Typography>
                <Button component={Link} to="/login" color="primary">
                  Login here
                </Button>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};
