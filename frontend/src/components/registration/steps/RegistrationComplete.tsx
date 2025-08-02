// frontend/src/components/registration/steps/RegistrationComplete.tsx
import React, { useEffect } from 'react';
import { Box, Typography, Button, Stack, Paper } from '@mui/material';
import { CheckCircle, School, Celebration } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

export const RegistrationComplete: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Trigger confetti
        confetti({
            particleCount: 100,
            spread: 70,
            zIndex: 20,
            origin: { y: 0.6 }
        });

        // Auto-redirect after 5 seconds
        const timer = setTimeout(() => {
            navigate('/profile');
        }, 10000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
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
                        background: 'linear-gradient(135deg, #483C32 0%, #00D4AA 100%)',
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
                            background: 'linear-gradient(135deg, #5C633A15 0%, #D4BC8C15 100%)',
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
                        // onClick={() => navigate('')}
                        >
                            <Link style={{ textDecoration: "none", color: "white" }} to="/profile">
                                Go to My Profile
                            </Link>
                        </Button>
                        <Typography variant="caption" color="text.secondary">
                            Redirecting automatically in 10 seconds...
                        </Typography>
                    </Stack>
                </Stack>
            </motion.div>
        </Box>
    );
};