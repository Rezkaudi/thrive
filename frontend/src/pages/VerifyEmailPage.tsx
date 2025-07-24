// frontend/src/pages/VerifyEmailPage.tsx
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
    CircularProgress,
} from '@mui/material';
import { Email } from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../services/api';

export const VerifyEmailPage: React.FC = () => {
    const navigate = useNavigate();
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [resendTimer, setResendTimer] = useState(60);
    const [resendLoading, setResendLoading] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // Get email from session storage
        const storedEmail = sessionStorage.getItem('registration_email');
        if (!storedEmail) {
            navigate('/register');
        } else {
            setEmail(storedEmail);
        }
    }, [navigate]);

    useEffect(() => {
        // Handle resend timer countdown
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

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
            await api.post('/auth/verify-email-code', { email, code });

            // Tokens are now set in cookies, redirect to profile
            sessionStorage.removeItem('registration_email');
            navigate('/register/success');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;

        setResendLoading(true);
        setError('');

        try {
            await api.post('/auth/resend-verification', { email });

            setResendTimer(60); // Set 60 second cooldown
            setError(''); // Clear any errors

            // Show success message
            const successMessage = document.createElement('div');
            successMessage.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #00B894; color: white; padding: 16px 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 9999; font-family: "Inter", sans-serif;';
            successMessage.textContent = 'Verification code resent successfully!';
            document.body.appendChild(successMessage);

            setTimeout(() => {
                if (document.body.contains(successMessage)) {
                    document.body.removeChild(successMessage);
                }
            }, 3000);

        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to resend verification code');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #4ECDC4 0%, #7ED4D0 100%)',
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
                                            background: 'linear-gradient(135deg, #4ECDC4 0%, #7ED4D0 100%)',
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
                                <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
                                    Verify Your Email
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    We've sent a verification code to
                                </Typography>
                                <Typography variant="body1" fontWeight={600} color="primary">
                                    {email}
                                </Typography>
                            </Box>

                            {/* Progress Indicator */}
                            <Box sx={{ mb: 4 }}>
                                <Stack direction="row" spacing={2} justifyContent="center">
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 4,
                                            bgcolor: 'success.main',
                                            borderRadius: 2,
                                        }}
                                    />
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
                                </Stack>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ display: 'block', textAlign: 'center', mt: 1 }}
                                >
                                    Step 2 of 3: Email Verification
                                </Typography>
                            </Box>

                            {error && (
                                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
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

                            <Stack spacing={2} mt={4}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    onClick={handleVerify}
                                    disabled={verificationCode.join('').length !== 6 || loading}
                                    sx={{ py: 1.5 }}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Verify & Continue'}
                                </Button>

                                <Box textAlign="center">
                                    <Typography variant="body2" color="text.secondary">
                                        Didn't receive the code?{' '}
                                        <Button
                                            variant="text"
                                            onClick={handleResend}
                                            disabled={resendTimer > 0 || resendLoading}
                                            sx={{ textTransform: 'none' }}
                                        >
                                            {resendLoading ? (
                                                <CircularProgress size={16} />
                                            ) : resendTimer > 0 ? (
                                                `Resend in ${resendTimer}s`
                                            ) : (
                                                'Resend Code'
                                            )}
                                        </Button>
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </motion.div>
            </Container>
        </Box>
    );
};