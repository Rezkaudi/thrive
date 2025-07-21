// frontend/src/components/registration/steps/RegistrationSuccess.tsx
import React, { useEffect } from 'react';
import { Box, Typography, Stack, Paper } from '@mui/material';
import { CheckCircle, School, Celebration, AutoAwesome } from '@mui/icons-material';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export const RegistrationSuccess: React.FC = () => {
    useEffect(() => {
        // Trigger confetti
        confetti({
            particleCount: 100,
            spread: 70,
            zIndex: 20,
            origin: { y: 0.6 }
        });

        // Additional confetti burst
        setTimeout(() => {
            confetti({
                particleCount: 50,
                angle: 60,
                spread: 55,
                origin: { x: 0 }
            });
        }, 250);

        setTimeout(() => {
            confetti({
                particleCount: 50,
                angle: 120,
                spread: 55,
                origin: { x: 1 }
            });
        }, 400);
    }, []);

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
                        background: 'linear-gradient(135deg, #00B894 0%, #00D4AA 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                        boxShadow: '0 8px 24px rgba(0, 184, 148, 0.3)',
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

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
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
                                    You're all set! Here's what's next:
                                </Typography>
                                <Stack spacing={1.5} alignItems="flex-start">
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <School color="primary" />
                                        <Typography variant="body2">
                                            Complete your profile to personalize your learning experience
                                        </Typography>
                                    </Stack>
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <Celebration color="secondary" />
                                        <Typography variant="body2">
                                            Explore our courses and start with your first lesson
                                        </Typography>
                                    </Stack>
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <AutoAwesome sx={{ color: '#FFD700' }} />
                                        <Typography variant="body2">
                                            Join the community and connect with fellow learners
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Paper>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Stack spacing={2}>
                            <Typography variant="body2" color="text.secondary">
                                Redirecting to your profile in a few seconds...
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                >
                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            bgcolor: 'primary.main',
                                        }}
                                    />
                                </motion.div>
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                                >
                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            bgcolor: 'primary.main',
                                        }}
                                    />
                                </motion.div>
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                                >
                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            bgcolor: 'primary.main',
                                        }}
                                    />
                                </motion.div>
                            </Box>
                        </Stack>
                    </motion.div>
                </Stack>
            </motion.div>
        </Box>
    );
};