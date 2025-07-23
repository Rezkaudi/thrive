// frontend/src/pages/SubscriptionSuccessPage.tsx
import React, { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Paper,
    CircularProgress,
    Stack,
    Card,
    CardContent,
    Avatar,
    Chip,
    Alert,
} from '@mui/material';
import {
    CheckCircle,
    School,
    ArrowForward,
    EmojiEvents,
    VideoCall,
    Groups,
    TrendingUp,
    Celebration,
    WorkspacePremium,
    AutoAwesome,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import api from '../services/api';

export const SubscriptionSuccessPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        const verifySession = async () => {
            if (!sessionId) {
                setError('Invalid session');
                setLoading(false);
                return;
            }

            try {
                // Verify the checkout session
                await api.post('/payment/verify-checkout-session', { sessionId });

                // Trigger confetti
                confetti({
                    particleCount: 100,
                    spread: 70,
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

                setLoading(false);
            } catch (err) {
                setError('Failed to verify payment');
                setLoading(false);
            }
        };

        verifySession();
    }, [sessionId]);

    if (loading) {
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
                <Card sx={{ p: 4, borderRadius: 3 }}>
                    <Stack spacing={3} alignItems="center">
                        <CircularProgress size={60} sx={{ color: '#FF6B6B' }} />
                        <Typography variant="h6" color="text.secondary">
                            Confirming your subscription...
                        </Typography>
                    </Stack>
                </Card>
            </Box>
        );
    }

    if (error) {
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
                <Container maxWidth="sm">
                    <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
                        <Box
                            sx={{
                                p: 3,
                                bgcolor: 'error.main',
                                color: 'white',
                                textAlign: 'center',
                            }}
                        >
                            <Typography variant="h5" fontWeight={600}>
                                Oops! Something went wrong
                            </Typography>
                        </Box>
                        <CardContent sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="body1" color="text.secondary" gutterBottom>
                                {error}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                                Don't worry, if you were charged, you'll receive a confirmation email.
                            </Typography>
                            <Stack direction="row" spacing={2} justifyContent="center">
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/dashboard')}
                                >
                                    Go to Dashboard
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => navigate('/subscription')}
                                    sx={{ color: 'white' }}
                                >
                                    Try Again
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Container>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #FF6B6B 0%, #FFB7C5 100%)',
                py: 4,
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Background decorations */}
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

            <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}>
                        {/* Success Header */}
                        <Box
                            sx={{
                                background: 'linear-gradient(135deg, #00B894 0%, #00D4AA 100%)',
                                color: 'white',
                                p: 4,
                                textAlign: 'center',
                                position: 'relative',
                            }}
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", duration: 0.5, delay: 0.2 }}
                            >
                                <Box
                                    sx={{
                                        width: 100,
                                        height: 100,
                                        borderRadius: '50%',
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto',
                                        mb: 3,
                                        backdropFilter: 'blur(10px)',
                                    }}
                                >
                                    <CheckCircle sx={{ fontSize: 60 }} />
                                </Box>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                <Typography variant="h3" fontWeight={800} gutterBottom>
                                    Welcome to Pro! 🎉
                                </Typography>
                                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                                    Your subscription is now active
                                </Typography>
                            </motion.div>
                        </Box>

                        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                            {/* Success Message */}
                            <Alert
                                severity="success"
                                icon={<Celebration />}
                                sx={{
                                    mb: 4,
                                    borderRadius: 2,
                                    '& .MuiAlert-icon': {
                                        fontSize: 28
                                    }
                                }}
                            >
                                <Typography variant="body1" fontWeight={600}>
                                    Congratulations! You now have unlimited access to all premium features.
                                </Typography>
                            </Alert>

                            {/* What's Included */}
                            {/* <Typography variant="h5" fontWeight={700} textAlign="center" gutterBottom>
                                Everything You Get with Pro
                            </Typography>
                            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
                                Start exploring your premium benefits right away
                            </Typography> */}

                            {/* <Stack spacing={3} sx={{ mb: 5 }}>
                                {[
                                    {
                                        icon: <School />,
                                        title: 'All Courses Unlocked',
                                        description: 'Access every lesson in Japan in Context and JLPT preparation',
                                        color: '#FF6B6B',
                                    },
                                    {
                                        icon: <VideoCall />,
                                        title: 'Live Speaking Sessions',
                                        description: 'Join unlimited speaking practice sessions with instructors',
                                        color: '#4ECDC4',
                                    },
                                    {
                                        icon: <Groups />,
                                        title: 'Exclusive Community',
                                        description: 'Connect with serious learners and native speakers',
                                        color: '#FFB7C5',
                                    },
                                    {
                                        icon: <EmojiEvents />,
                                        title: 'Bonus Points & Rewards',
                                        description: 'Earn double points and unlock special achievements',
                                        color: '#00B894',
                                    },
                                ].map((benefit, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + index * 0.1 }}
                                    >
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                borderRadius: 2,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    borderColor: benefit.color,
                                                    transform: 'translateX(8px)',
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                                },
                                            }}
                                        >
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar
                                                    sx={{
                                                        bgcolor: `${benefit.color}20`,
                                                        color: benefit.color,
                                                        width: 48,
                                                        height: 48,
                                                    }}
                                                >
                                                    {benefit.icon}
                                                </Avatar>
                                                <Box flex={1}>
                                                    <Typography variant="subtitle1" fontWeight={600}>
                                                        {benefit.title}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {benefit.description}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Paper>
                                    </motion.div>
                                ))}
                            </Stack> */}

                            {/* Quick Actions */}
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 4,
                                    background: 'linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%)',
                                    borderRadius: 3,
                                    mb: 4,
                                    textAlign: 'center',
                                }}
                            >
                                <Stack spacing={1} alignItems="center" mb={3}>
                                    <AutoAwesome sx={{ fontSize: 32, color: 'warning.main' }} />
                                    <Typography variant="h6" fontWeight={600}>
                                        Ready to start your journey?
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Choose where you'd like to begin
                                    </Typography>
                                </Stack>

                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        startIcon={<School />}
                                        onClick={() => navigate('/classroom')}
                                        fullWidth
                                        sx={{
                                            py: 1.5,
                                            background: 'linear-gradient(135deg, #FF6B6B 0%, #FFB7C5 100%)',
                                            color: 'white',
                                            fontWeight: 600,
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #E55555 0%, #FF9FAC 100%)',
                                            }
                                        }}
                                    >
                                        Start Learning
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        size="large"
                                        startIcon={<TrendingUp />}
                                        onClick={() => navigate('/dashboard')}
                                        fullWidth
                                        sx={{
                                            py: 1.5,
                                            fontWeight: 600,
                                            borderWidth: 2,
                                            '&:hover': {
                                                borderWidth: 2,
                                            }
                                        }}
                                    >
                                        View Dashboard
                                    </Button>
                                </Stack>
                            </Paper>

                            {/* Pro Tips */}
                            <Box sx={{ textAlign: 'center' }}>
                                <Chip
                                    icon={<WorkspacePremium />}
                                    label="PRO TIP"
                                    size="small"
                                    color="primary"
                                    sx={{ mb: 2, fontWeight: 600 }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                    Start with the placement test to get personalized recommendations
                                    based on your current Japanese level.
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </motion.div>
            </Container>
        </Box>
    );
};