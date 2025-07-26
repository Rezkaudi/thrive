import React, { useState } from 'react';
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
} from '@mui/material';
import { Email, ArrowBack, CheckCircle } from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../services/api';

export const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.post('/auth/forgot-password', { email });
            setSuccess(true);
        } catch (err: any) {
            console.log(err)
            // Check for rate limiting
            if (err.response?.status === 429) {
                setError('Too many requests. Please try again later.');
            } else {
                setError(err.response.data.error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #FF6B6B 0%, #FFB7C5 100%)',
                }}
            >
                <Container maxWidth="sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card sx={{ borderRadius: 3, boxShadow: 10 }}>
                            <CardContent sx={{ p: 5, textAlign: 'center' }}>
                                <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
                                <Typography variant="h4" fontWeight={700} gutterBottom>
                                    Check Your Email
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                                    We've sent a password reset link to <strong>{email}</strong>
                                </Typography>
                                <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                                    <Typography variant="body2">
                                        The link will expire in 1 hour. If you don't see the email, check your spam folder.
                                    </Typography>
                                </Alert>
                                <Stack spacing={2}>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        onClick={() => navigate('/login')}
                                    >
                                        Back to Login
                                    </Button>
                                    <Button
                                        variant="text"
                                        onClick={() => {
                                            setSuccess(false);
                                            setEmail('');
                                        }}
                                    >
                                        Try a different email
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    </motion.div>
                </Container>
            </Box>
        );
    }

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
                            <Box mb={4}>
                                <Button
                                    startIcon={<ArrowBack />}
                                    onClick={() => navigate('/login')}
                                    sx={{ mb: 3 }}
                                >
                                    Back to Login
                                </Button>

                                <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
                                    Forgot Password? 🔑
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    No worries! Enter your email and we'll send you reset instructions.
                                </Typography>
                            </Box>

                            <Collapse in={!!error}>
                                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                                    {error}
                                </Alert>
                            </Collapse>

                            <form onSubmit={handleSubmit}>
                                <Stack spacing={3}>
                                    <TextField
                                        fullWidth
                                        label="Email Address"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Email color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                        helperText="Enter the email associated with your account"
                                    />

                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        disabled={loading || !email}
                                        sx={{ py: 1.5 }}
                                    >
                                        {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
                                    </Button>
                                </Stack>
                            </form>

                            {/* <Alert severity="info" sx={{ mt: 3 }}>
                                <Typography variant="caption">
                                    For security reasons, we'll always say we've sent an email, even if the address isn't registered.
                                </Typography>
                            </Alert> */}
                        </CardContent>
                    </Card>
                </motion.div>
            </Container>
        </Box>
    );
};