// frontend/src/pages/registration/RegistrationCompletePage.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Card,
    CardContent,
    Typography,
    Button,
    Stack,
    Paper,
} from '@mui/material';
import { CheckCircle, School, Celebration } from '@mui/icons-material';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export const RegistrationCompletePage: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Verify all steps completed
        const email = sessionStorage.getItem('registration_email');
        const step = sessionStorage.getItem('registration_step');

        if (!email || step !== '4') {
            navigate('/register/email');
            return;
        }

        // Trigger confetti
        confetti({
            particleCount: 100,
            spread: 70,
            zIndex: 9999,
            origin: { y: 0.6 }
        });

        // Clear registration data after a delay
        const cleanupTimer = setTimeout(() => {
            sessionStorage.removeItem('registration_email');
            sessionStorage.removeItem('registration_code');
            sessionStorage.removeItem('registration_plan');
            sessionStorage.removeItem('stripe_payment_intent_id');
            sessionStorage.removeItem('registration_step');
        }, 5000);

        // Auto-redirect after 10 seconds
        const redirectTimer = setTimeout(() => {
            navigate('/profile');
        }, 10000);

        return () => {
            clearTimeout(cleanupTimer);
            clearTimeout(redirectTimer);
        };
    }, [navigate]);

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                // background: 'linear-gradient(135deg, #00B894 0%, #00D4AA 100%)',
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
                <Card sx={{ borderRadius: 3, boxShadow: 10 }}>
                    <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                        {/* Progress Indicator - All Complete */}
                        <Box sx={{ mb: 4 }}>
                            <Stack direction="row" spacing={2} justifyContent="center">
                                {[1, 2, 3, 4].map((step) => (
                                    <Box
                                        key={step}
                                        sx={{
                                            width: 40,
                                            height: 4,
                                            bgcolor: 'success.main',
                                            borderRadius: 2,
                                        }}
                                    />
                                ))}
                            </Stack>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block', textAlign: 'center', mt: 1 }}
                            >
                                Registration Complete!
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
                                        width: 100,
                                        height: 100,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #00B894 0%, #00D4AA 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mx: 'auto',
                                        mb: 3,
                                    }}
                                >
                                    <CheckCircle sx={{ fontSize: 60, color: 'white' }} />
                                </Box>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Stack spacing={3}>
                                    <Box>
                                        <Typography variant="h4" fontWeight={700} gutterBottom>
                                            Welcome to Thrive in Japan! 🎉
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">
                                            Your account has been created successfully
                                        </Typography>
                                    </Box>

                                    <Paper
                                        sx={{
                                            p: 3,
                                            background: 'linear-gradient(135deg, #FF6B6B15 0%, #FFB7C515 100%)',
                                            border: '1px solid',
                                            borderColor: 'primary.light',
                                        }}
                                    >
                                        <Stack spacing={2}>
                                            <Typography variant="h6" fontWeight={600}>
                                                What's next?
                                            </Typography>
                                            <Stack spacing={1} alignItems="flex-start">
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <School color="primary" />
                                                    <Typography variant="body2">
                                                        Complete your profile to personalize your learning
                                                    </Typography>
                                                </Stack>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Celebration color="secondary" />
                                                    <Typography variant="body2">
                                                        Explore courses and start your first lesson
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                        </Stack>
                                    </Paper>

                                    <Stack spacing={2}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            size="large"
                                            onClick={() => navigate('/profile')}
                                        >
                                            Go to My Profile
                                        </Button>
                                        <Typography variant="caption" color="text.secondary">
                                            Redirecting automatically in 10 seconds...
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </motion.div>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};