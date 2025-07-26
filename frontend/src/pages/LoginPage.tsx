// frontend/src/pages/LoginPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
  Divider,
  Stack,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { login, clearError } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store/store';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading, error } = useSelector((state: RootState) => state.auth);


  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(login(formData));
    if (login.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (error) {
      dispatch(clearError());
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile');
    }
    dispatch(clearError());
  }, [isAuthenticated, navigate, dispatch]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #FF6B6B 0%, #FFB7C5 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: -200,
          right: -200,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -300,
          left: -300,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card sx={{ borderRadius: 3, boxShadow: 10 }}>
            <CardContent sx={{ p: 5 }}>
              <Box textAlign="center" mb={4}>
                <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
                  Welcome Back! 🌸
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Continue your Japanese learning journey
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange('password')}
                    required
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
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ py: 1.5 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Login'}
                  </Button>
                </Stack>
              </form>

              <Box textAlign="center" mt={3}>
                <Button
                  color="primary"
                  size="small"
                  component={Link}
                  to="/forgot-password"
                >
                  Forgot Password?
                </Button>
              </Box>

              <Divider sx={{ my: 3 }}>OR</Divider>

              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Don't have an account?
                </Typography>
                <Button
                  component={Link}
                  to="/register"
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  Sign Up Now
                </Button>
              </Box>

              {/* <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="caption">
                  After payment, you'll receive your login credentials via email.
                  Check your spam folder if you don't see it.
                </Typography>
              </Alert> */}
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};