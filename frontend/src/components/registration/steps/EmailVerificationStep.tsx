// frontend/src/components/registration/steps/EmailVerificationStep.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Stack,
    Alert,
    CircularProgress,
} from '@mui/material';
import { CheckCircle, ArrowBack } from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store/store';
import { login } from '../../../store/slices/authSlice';

interface EmailVerificationStepProps {
    email: string;
    password: string;
    name: string;
    onNext: () => void;
    onBack: () => void;
}

export const EmailVerificationStep: React.FC<EmailVerificationStepProps> = ({
    email,
    password,
    name,
    onNext,
    onBack,
}) => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(60);
    const [isRegistering, setIsRegistering] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // Send verification code on component mount
        if (!isRegistering) {
            registerUser();
        }
    }, []);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const registerUser = async () => {
        setIsRegistering(true);
        setError('');
        setLoading(true);

        try {
            // Register the user
            await api.post('/auth/register', { email });

            // Send verification code
            await api.post('/auth/send-verification-code', { email });
            setResendTimer(60);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to register');
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
            // Verify email
            await api.post('/auth/verify-email', { email, code });

            // Complete registration with password
            await api.post('/auth/complete-registration', {
                email,
                name,
                password,
                stripePaymentIntentId: 'free-registration', // No payment for this flow
            });

            // Auto-login the user
            const loginResult = await dispatch(login({ email, password }));

            if (login.fulfilled.match(loginResult)) {
                onNext();
                // Redirect to profile after a short delay
                setTimeout(() => {
                    navigate('/profile');
                }, 3000);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;

        setError('');
        setLoading(true);

        try {
            await api.post('/auth/send-verification-code', { email });
            setResendTimer(60);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to resend code');
        } finally {
            setLoading(false);
        }
    };

    return (
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
                        Verify Your Email
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

                <Stack spacing={2}>
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
                        onClick={onBack}
                        startIcon={<ArrowBack />}
                        sx={{ alignSelf: 'center' }}
                    >
                        Back to Details
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};