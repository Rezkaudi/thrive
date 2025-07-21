// frontend/src/pages/registration/CreateAccountPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
    IconButton,
    CircularProgress,
    LinearProgress,
    Chip,
} from '@mui/material';
import {
    Person,
    Lock,
    Visibility,
    VisibilityOff,
    CheckCircle,
    Cancel,
    ArrowBack,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../../services/api';

interface PasswordStrength {
    score: number;
    feedback: string[];
    color: string;
}

export const CreateAccountPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({
        name: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [verifyingPayment, setVerifyingPayment] = useState(true);
    const [paymentVerified, setPaymentVerified] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
        score: 0,
        feedback: [],
        color: 'error',
    });

    // Use refs to track if we've already called the register endpoint
    const hasRegistered = useRef(false);
    const isVerifying = useRef(false);

    useEffect(() => {
        // Verify payment and previous steps
        const verifyPayment = async () => {
            // Prevent multiple simultaneous verifications
            if (isVerifying.current) {
                return;
            }
            isVerifying.current = true;

            const email = sessionStorage.getItem('registration_email');
            const sessionId = searchParams.get('session_id');

            if (!email) {
                navigate('/register/email');
                return;
            }

            if (!sessionId) {
                navigate('/register/payment');
                return;
            }

            // Check if we've already processed this session
            const processedSessionId = sessionStorage.getItem('processed_session_id');
            if (processedSessionId === sessionId) {
                setPaymentVerified(true);
                setVerifyingPayment(false);
                return;
            }

            try {
                // Verify the Stripe checkout session
                const response = await api.post('/payment/verify-checkout-session', {
                    sessionId,
                });

                console.log(response);

                if (response.data.status === 'complete' || response.data.status === 'paid') {
                    setPaymentVerified(true);
                    sessionStorage.setItem('registration_step', '3');

                    // Store the processed session ID
                    sessionStorage.setItem('processed_session_id', sessionId);

                    // Only call register if we haven't already
                    if (!hasRegistered.current) {
                        hasRegistered.current = true;

                        await api.post('/auth/register', {
                            status: response.data.status,
                            plan: response.data.metadata.plan,
                            email: response.data.metadata.email,
                        });
                    }

                } else {
                    throw new Error('Payment not completed');
                }
            } catch (error) {
                if (error instanceof Error && 'response' in error) {
                    const axiosError = error as any; // or create a proper AxiosError type
                    if (axiosError.response?.status !== 409) {
                        setError('Payment verification failed. Please try again.');
                        setTimeout(() => navigate('/register/payment'), 3000);
                    } else {
                        // If it's a duplicate, just mark as verified
                        setPaymentVerified(true);
                        sessionStorage.setItem('processed_session_id', sessionId);
                    }
                } else {
                    // Handle unexpected error types
                    setError('An unexpected error occurred');
                    setTimeout(() => navigate('/register/payment'), 3000);
                }
            } finally {
                setVerifyingPayment(false);
                isVerifying.current = false;
            }
        };

        verifyPayment();
    }, [navigate, searchParams]);

    useEffect(() => {
        console.log("register", paymentVerified);
    }, [paymentVerified]);

    const calculatePasswordStrength = (password: string): PasswordStrength => {
        let score = 0;
        const feedback = [];

        if (password.length >= 8) score += 25;
        else feedback.push('At least 8 characters');

        if (/[A-Z]/.test(password)) score += 25;
        else feedback.push('One uppercase letter');

        if (/[a-z]/.test(password)) score += 25;
        else feedback.push('One lowercase letter');

        if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 25;
        else feedback.push('One number or special character');

        let color = 'error';
        if (score >= 75) color = 'success';
        else if (score >= 50) color = 'warning';

        return { score, feedback, color: color as any };
    };

    const handlePasswordChange = (value: string) => {
        setFormData({ ...formData, password: value });
        setPasswordStrength(calculatePasswordStrength(value));
    };

    const handleSubmit = async () => {
        setError('');

        // Validation
        if (!formData.name.trim()) {
            setError('Please enter your name');
            return;
        }

        if (passwordStrength.score < 100) {
            setError('Please create a stronger password');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const email = sessionStorage.getItem('registration_email');
            const paymentIntentId = sessionStorage.getItem('stripe_payment_intent_id');

            await api.post('/auth/complete-registration', {
                email,
                name: formData.name,
                password: formData.password,
                stripePaymentIntentId: paymentIntentId,
            });

            // Clear the processed session ID on successful completion
            sessionStorage.removeItem('processed_session_id');
            sessionStorage.setItem('registration_step', '4');
            navigate('/register/complete');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    if (verifyingPayment) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #FF6B6B 0%, #FFB7C5 100%)',
                }}
            >
                <Card sx={{ p: 4, textAlign: 'center' }}>
                    <CircularProgress size={60} sx={{ mb: 2 }} />
                    <Typography variant="h6">Verifying your payment...</Typography>
                </Card>
            </Box>
        );
    }

    if (!paymentVerified) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #FF6B6B 0%, #FFB7C5 100%)',
                }}
            >
                <Card sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="error" gutterBottom>
                        Payment verification failed
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Redirecting to payment page...
                    </Typography>
                </Card>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                // background: 'linear-gradient(135deg, #4ECDC4 0%, #7ED4D0 100%)',
                py: 4,
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
            <Container maxWidth="sm">
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/register/payment')}
                    sx={{
                        color: 'white',
                        mb: 3,
                        '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                        },
                    }}
                >
                    Back to Payment
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
                                        bgcolor: 'success.main',
                                        borderRadius: 2,
                                    }}
                                />
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
                                Step 3 of 4: Create Your Account
                            </Typography>
                        </Box>

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
                                        background: 'linear-gradient(135deg, #4ECDC4 0%, #7ED4D0 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mx: 'auto',
                                        mb: 3,
                                    }}
                                >
                                    <Person sx={{ fontSize: 40, color: 'white' }} />
                                </Box>
                            </motion.div>
                            <Typography variant="h5" fontWeight={600} gutterBottom>
                                Almost there!
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={3}>
                                Create your account to start learning
                            </Typography>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                                {error}
                            </Alert>
                        )}

                        <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 3 }}>
                            Payment successful! Complete your profile to continue.
                        </Alert>

                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                label="Your Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Person color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Box>
                                <TextField
                                    fullWidth
                                    type={showPassword ? 'text' : 'password'}
                                    label="Create Password"
                                    value={formData.password}
                                    onChange={(e) => handlePasswordChange(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock color="action" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                {formData.password && (
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
                                                    sx={{color: "white"}}
                                                />
                                            )}
                                        </Stack>
                                    </Box>
                                )}
                            </Box>

                            <TextField
                                fullWidth
                                type={showConfirmPassword ? 'text' : 'password'}
                                label="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                error={!!formData.confirmPassword && formData.password !== formData.confirmPassword}
                                helperText={
                                    formData.confirmPassword && formData.password !== formData.confirmPassword
                                        ? 'Passwords do not match'
                                        : ''
                                }
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock color="action" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                edge="end"
                                            >
                                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={handleSubmit}
                                disabled={loading || !formData.name || passwordStrength.score < 100 || formData.password !== formData.confirmPassword}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Create Account'}
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};