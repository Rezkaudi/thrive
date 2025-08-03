import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Stack,
    Collapse,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    Lock,
    Visibility,
    VisibilityOff,
    CheckCircle,
    Cancel,
    Check,
    ArrowBack,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../services/api';

export const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false,
        hasMinLength: false,
    });

    // Get token from URL
    const getTokenFromUrl = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get('token');
    };

    // Validate token on mount
    useEffect(() => {
        const validateToken = async () => {
            const token = getTokenFromUrl();
            if (!token) {
                setError('Invalid reset link');
                setValidating(false);
                return;
            }

            try {
                const data = await api.get(`/auth/reset-password/validate/${token}`);
                console.log(data.data);

                if (data.data.valid) {
                    setTokenValid(true);
                    setEmail(data.data.email);
                } else {
                    setError(data.data.error || 'Invalid or expired reset link');
                }
            } catch (err) {
                setError('Error validating reset link');
            } finally {
                setValidating(false);
            }
        };

        validateToken();
    }, []);

    // Check password strength
    useEffect(() => {
        setPasswordStrength({
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumber: /\d/.test(password),
            hasSpecialChar: /[@$!%*?&#]/.test(password),
            hasMinLength: password.length >= 8,
        });
    }, [password]);

    const isPasswordValid = () => {
        return Object.values(passwordStrength).every(Boolean);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isPasswordValid()) {
            setError('Please meet all password requirements');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = getTokenFromUrl();
            await api.post('/auth/reset-password', { token, newPassword: password });
            setSuccess(true);
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Loading state
    if (validating) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #5C633A 0%, #D4BC8C 100%)',
                }}
            >
                <Card sx={{ borderRadius: 3, boxShadow: 10, p: 2 }}>
                    <CardContent>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <CircularProgress size={24} sx={{ color: '#5C633A' }} />
                            <Typography color="text.secondary">
                                Validating reset link...
                            </Typography>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    // Error state
    if (!tokenValid && !validating) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #5C633A 0%, #D4BC8C 100%)',
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
                <Container maxWidth="sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card sx={{ borderRadius: 3, boxShadow: 10 }}>
                            <CardContent sx={{ p: { xs: 2, sm: 3, md: 5 }, textAlign: 'center' }}>
                                <Box
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        bgcolor: 'error.lighter',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mx: 'auto',
                                        mb: 3,
                                    }}
                                >
                                    <Cancel sx={{ fontSize: 40, color: 'error.main' }} />
                                </Box>
                                <Typography variant="h4" fontWeight={700} gutterBottom>
                                    Invalid Reset Link
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                                    {error || 'This password reset link is invalid or has expired.'}
                                </Typography>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={() => navigate('/forgot-password')}
                                    size="large"
                                >
                                    Request New Reset Link
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </Container>
            </Box>
        );
    }

    // Success state
    if (success) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #5C633A 0%, #D4BC8C 100%)',
                }}
            >
                <Container maxWidth="sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card sx={{ borderRadius: 3, boxShadow: 10 }}>
                            <CardContent sx={{ p: { xs: 2, sm: 3, md: 5 }, textAlign: 'center' }}>
                                <Box
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        bgcolor: 'success.lighter',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mx: 'auto',
                                        mb: 3,
                                    }}
                                >
                                    <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
                                </Box>
                                <Typography variant="h4" fontWeight={700} gutterBottom>
                                    Password Reset Successful!
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                                    Your password has been successfully reset. You can now login with your new password.
                                </Typography>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={() => navigate('/login')}
                                    size="large"
                                >
                                    Go to Login
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </Container>
            </Box>
        );
    }

    // Reset form
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #5C633A 0%, #D4BC8C 100%)',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Background decoration */}
            <Box
                sx={{
                    position: 'absolute',
                    top: -128,
                    right: -128,
                    width: 384,
                    height: 384,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    filter: 'blur(48px)',
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: -192,
                    left: -192,
                    width: 600,
                    height: 600,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    filter: 'blur(48px)',
                }}
            />

            <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card sx={{ borderRadius: 3, boxShadow: 10, my: 4 }}>
                        <CardContent sx={{ p: { xs: 2, sm: 3, md: 5 } }}>
                            <Typography variant="h4" mt={3} fontWeight={700} color="primary" gutterBottom>
                                Create New Password 🔐
                            </Typography>
                            <Typography variant="body1" color="text.secondary" gutterBottom>
                                Reset password for
                            </Typography>
                            <Typography variant="body1" fontWeight={600} sx={{ mb: 3 }}>
                                {email}
                            </Typography>

                            <Collapse in={!!error}>
                                <Alert
                                    severity="error"
                                    sx={{ mb: 3 }}
                                    onClose={() => setError(null)}
                                >
                                    {error}
                                </Alert>
                            </Collapse>

                            <form onSubmit={handleSubmit}>
                                <Stack spacing={3}>
                                    <TextField
                                        fullWidth
                                        label="New Password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
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

                                    <TextField
                                        fullWidth
                                        label="Confirm New Password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Lock color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    {/* Password strength indicator */}
                                    <Box>
                                        <Typography variant="body2" fontWeight={500} gutterBottom>
                                            Password Requirements:
                                        </Typography>
                                        <List dense sx={{ py: 0 }}>
                                            {[
                                                { check: passwordStrength.hasMinLength, text: 'At least 8 characters' },
                                                { check: passwordStrength.hasUpperCase, text: 'One uppercase letter' },
                                                { check: passwordStrength.hasLowerCase, text: 'One lowercase letter' },
                                                { check: passwordStrength.hasNumber, text: 'One number' },
                                                { check: passwordStrength.hasSpecialChar, text: 'One special character (@$!%*?&#)' },
                                            ].map((req, index) => (
                                                <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                                        <Check
                                                            sx={{
                                                                fontSize: 18,
                                                                color: req.check ? 'success.main' : 'text.disabled',
                                                            }}
                                                        />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={req.text}
                                                        primaryTypographyProps={{
                                                            variant: 'body2',
                                                            color: req.check ? 'success.dark' : 'text.secondary',
                                                        }}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>

                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        disabled={loading || !isPasswordValid() || password !== confirmPassword}
                                        sx={{ py: 1.5 }}
                                    >
                                        {loading ? <CircularProgress size={24} /> : 'Reset Password'}
                                    </Button>
                                </Stack>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </Container>
        </Box>
    );
};