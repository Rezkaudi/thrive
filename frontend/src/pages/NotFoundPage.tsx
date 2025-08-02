// frontend/src/pages/NotFoundPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Stack,
    Card,
    CardContent,
} from '@mui/material';
import {
    Home,
    ArrowBack,
    SentimentDissatisfied,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

export const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #5C633A 0%, #D4BC8C 100%)',
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
                        <CardContent sx={{ p: 5, textAlign: 'center' }}>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            >
                                <Box
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #A6531C 0%, #7ED4D0 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mx: 'auto',
                                        mb: 4,
                                    }}
                                >
                                    <SentimentDissatisfied sx={{ fontSize: 60, color: 'white' }} />
                                </Box>
                            </motion.div>

                            <Typography
                                variant="h1"
                                sx={{
                                    fontSize: '6rem',
                                    fontWeight: 700,
                                    color: 'primary.main',
                                    mb: 2,
                                }}
                            >
                                404
                            </Typography>

                            <Typography variant="h4" fontWeight={600} gutterBottom>
                                Page Not Found
                            </Typography>

                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{ mb: 4 }}
                            >
                                Oops! The page you're looking for seems to have wandered off like a
                                cherry blossom petal in the wind. Let's get you back on track!
                            </Typography>

                            <Stack direction="row" spacing={2} justifyContent="center">
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<Home />}
                                    onClick={() => navigate('/')}
                                    sx={{ py: 1.5 }}
                                >
                                    Go Home
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    startIcon={<ArrowBack />}
                                    onClick={() => navigate(-1)}
                                    sx={{ py: 1.5 }}
                                >
                                    Go Back
                                </Button>
                            </Stack>

                            <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Lost in translation? Here are some helpful links:
                                </Typography>
                                <Stack
                                    direction="row"
                                    spacing={2}
                                    justifyContent="center"
                                    sx={{ mt: 2 }}
                                >
                                    <Button
                                        size="small"
                                        onClick={() => navigate('/dashboard')}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Dashboard
                                    </Button>
                                    <Button
                                        size="small"
                                        onClick={() => navigate('/classroom')}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Classroom
                                    </Button>
                                    <Button
                                        size="small"
                                        onClick={() => navigate('/community')}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Community
                                    </Button>
                                </Stack>
                            </Box>
                        </CardContent>
                    </Card>
                </motion.div>
            </Container>
        </Box>
    );
};