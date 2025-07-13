// frontend/src/pages/registration/EmailVerificationPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Stack,
    Alert,
    InputAdornment,
    CircularProgress,
} from '@mui/material';
import { Email, CheckCircle, Send, ArrowBack } from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../../services/api';

export const EmailVerificationPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState(() => {
        // Get email from sessionStorage if exists
        return sessionStorage.getItem('registration_email') || '';
    });
    const [showVerification, setShowVerification] = useState(false);
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleSendCode = async () => {
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/send-verification-code', { email });
            // Store email in sessionStorage
            sessionStorage.setItem('registration_email', email);
            setShowVerification(true);
            setResendTimer(60);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to send verification code');
        } finally {
            setLoading(false);
        }
    };

    const handleCodeChange = (index: number, value: string) => {
        if (value.length > 1) return;

        const newCode = [...verificationCode];
        newCode[index] = value;
        setVerificationCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const code = verificationCode.join('');
        if (code.length !== 6) {
            setError('Please enter the complete verification code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.post('/auth/verify-email', { email, code });
            // Store verification data
            sessionStorage.setItem('registration_step', '1');
            // Navigate to payment page
            navigate('/register/payment');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;
        handleSendCode();
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #FF6B6B 0%, #FFB7C5 100%)',
                py: 4,
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
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/')}
                    sx={{
                        color: 'white',
                        mb: 3,
                        '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                        },
                    }}
                >
                    Back to Home
                </Button>

                <Card sx={{ borderRadius: 3, boxShadow: 10 }}>
                    <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                        {/* Progress Indicator */}
                        <Box sx={{ mb: 4 }}>
                            <Stack direction="row" spacing={2} justifyContent="center">
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 4,
                                        bgcolor: 'primary.main',
                                        borderRadius: 2,
                                    }}
                                />
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 4,
                                        bgcolor: 'grey.300',
                                        borderRadius: 2,
                                    }}
                                />
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 4,
                                        bgcolor: 'grey.300',
                                        borderRadius: 2,
                                    }}
                                />
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 4,
                                        bgcolor: 'grey.300',
                                        borderRadius: 2,
                                    }}
                                />
                            </Stack>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block', textAlign: 'center', mt: 1 }}
                            >
                                Step 1 of 4: Verify Email
                            </Typography>
                        </Box>

                        {/* Logo and Title */}
                        <Box textAlign="center" mb={4}>
                            <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
                                Welcome to Thrive in Japan 🌸
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Join thousands learning Japanese with cultural context
                            </Typography>
                        </Box>

                        {!showVerification ? (
                            <Box>
                                <Stack spacing={3}>
                                    <Box textAlign="center">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 80,
                                                    height: 80,
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #FF6B6B 0%, #FFB7C5 100%)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mx: 'auto',
                                                    mb: 3,
                                                }}
                                            >
                                                <Email sx={{ fontSize: 40, color: 'white' }} />
                                            </Box>
                                        </motion.div>
                                        <Typography variant="h5" fontWeight={600} gutterBottom>
                                            Let's get started!
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Enter your email to begin your Japanese learning journey
                                        </Typography>
                                    </Box>

                                    <TextField
                                        fullWidth
                                        autoComplete='true'
                                        type="email"
                                        label="Email Address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        error={!!error}
                                        helperText={error}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Email color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{ mt: 2 }}
                                    />

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        onClick={handleSendCode}
                                        disabled={!email || loading}
                                        endIcon={loading ? <CircularProgress size={20} /> : <Send />}
                                    >
                                        {loading ? 'Sending...' : 'Send Verification Code'}
                                    </Button>

                                    <Typography variant="body2" color="text.secondary" textAlign="center">
                                        We'll send a 6-digit code to verify your email
                                    </Typography>
                                </Stack>
                            </Box>
                        ) : (
                            <Box>
                                <Stack spacing={3}>
                                    <Box textAlign="center">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 80,
                                                    height: 80,
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #00B894 0%, #00D4AA 100%)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mx: 'auto',
                                                    mb: 3,
                                                }}
                                            >
                                                <CheckCircle sx={{ fontSize: 40, color: 'white' }} />
                                            </Box>
                                        </motion.div>
                                        <Typography variant="h5" fontWeight={600} gutterBottom>
                                            Check your email
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            We've sent a verification code to
                                        </Typography>
                                        <Typography variant="body1" fontWeight={600} color="primary">
                                            {email}
                                        </Typography>
                                    </Box>

                                    {error && (
                                        <Alert severity="error" onClose={() => setError('')}>
                                            {error}
                                        </Alert>
                                    )}

                                    <Box>
                                        <Typography variant="body2" color="text.secondary" textAlign="center" mb={2}>
                                            Enter the 6-digit code
                                        </Typography>
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            {verificationCode.map((digit, index) => (
                                                <TextField
                                                    key={index}
                                                    inputRef={(el) => (inputRefs.current[index] = el)}
                                                    value={digit}
                                                    onChange={(e) => handleCodeChange(index, e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                                    inputProps={{
                                                        maxLength: 1,
                                                        style: {
                                                            textAlign: 'center',
                                                            fontSize: '1.5rem',
                                                            fontWeight: 600,
                                                        },
                                                    }}
                                                    sx={{
                                                        width: 50,
                                                        '& .MuiOutlinedInput-root': {
                                                            height: 60,
                                                        },
                                                    }}
                                                />
                                            ))}
                                        </Stack>
                                    </Box>

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        onClick={handleVerify}
                                        disabled={verificationCode.join('').length !== 6 || loading}
                                    >
                                        {loading ? <CircularProgress size={24} /> : 'Verify & Continue'}
                                    </Button>

                                    <Box textAlign="center">
                                        <Typography variant="body2" color="text.secondary">
                                            Didn't receive the code?{' '}
                                            <Button
                                                variant="text"
                                                onClick={handleResend}
                                                disabled={resendTimer > 0}
                                                sx={{ textTransform: 'none' }}
                                            >
                                                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                                            </Button>
                                        </Typography>
                                    </Box>

                                    <Button
                                        variant="text"
                                        onClick={() => {
                                            setShowVerification(false);
                                            setVerificationCode(['', '', '', '', '', '']);
                                            setError('');
                                        }}
                                        startIcon={<ArrowBack />}
                                    >
                                        Change Email
                                    </Button>
                                </Stack>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};