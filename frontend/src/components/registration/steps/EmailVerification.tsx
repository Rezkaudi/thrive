// frontend/src/components/registration/steps/EmailVerification.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Stack,
    Alert,
    InputAdornment,
    CircularProgress,
} from '@mui/material';
import { Email, CheckCircle, Send } from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../../../services/api';

interface EmailVerificationProps {
    onNext: (data: { email: string; verificationCode: string }) => void;
    email: string;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({
    onNext,
    email: initialEmail,
}) => {
    const [email, setEmail] = useState(initialEmail);
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
            onNext({ email, verificationCode: code });
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

    if (!showVerification) {
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
                                    background: 'linear-gradient(135deg, #5C633A 0%, #D4BC8C 100%)',
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
        );
    }

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
                                background: 'linear-gradient(135deg, #483C32 0%, #00D4AA 100%)',
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
            </Stack>
        </Box>
    );
};