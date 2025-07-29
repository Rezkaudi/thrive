// frontend/src/pages/registration/SubscriptionPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Stack,
    Paper,
    Chip,
    Alert,
    CircularProgress,
    Card,
    CardContent,
} from '@mui/material';
import {
    ArrowBack,
    Check,
    Close,
    School,
    CalendarMonth,
    Person,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import api from '../services/api';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY!);

interface PlanOption {
    id: string;
    name: string;
    price: number;
    currency: string;
    period: string;
    features: {
        title: string;
        included: boolean;
    }[];
    recommended?: boolean;
    stripePriceId: string;
}

const plans: PlanOption[] = [
    // {
    //     id: 'one-time',
    //     name: 'Japan in Context Premiere',
    //     price: 220000,
    //     currency: '¥',
    //     period: 'one-time',
    //     stripePriceId: process.env.REACT_APP_STRIPE_ONE_TIME_PRICE_ID || 'price_one-time',
    //     features: [
    //         { title: 'Thrive in Japan Platform', included: true },
    //         { title: 'Speaking Sessions', included: false },
    //         { title: '"Japan in Context" Curriculum', included: true },
    //         { title: '"JLPT in Context" Curriculum', included: false },
    //         { title: 'Access to Exclusive Events and Meet Ups', included: true },
    //         { title: '1-on-1 JCT Certified Personal Coaching', included: true },
    //     ],
    // },
    {
        id: 'monthly',
        name: 'Monthly Subscription',
        price: 19980,
        currency: '¥',
        period: 'month',
        stripePriceId: process.env.REACT_APP_STRIPE_MONTHLY_PRICE_ID || 'price_monthly',
        recommended: true,
        features: [
            { title: 'Thrive in Japan Platform', included: true },
            { title: 'Unlimited Speaking Sessions', included: true },
            { title: '"Japan in Context" Curriculum', included: true },
            { title: '"JLPT in Context" Curriculum', included: true },
            { title: 'Access to Exclusive Events and Meet Ups', included: true },
        ],
    },
    {
        id: 'yearly',
        name: 'Yearly Subscription',
        price: 199000,
        currency: '¥',
        period: 'year',
        stripePriceId: process.env.REACT_APP_STRIPE_YEARLY_PRICE_ID || 'price_yearly',
        features: [
            { title: 'Thrive in Japan Platform', included: true },
            { title: 'Unlimited Speaking Sessions', included: true },
            { title: '"Japan in Context" Curriculum', included: true },
            { title: '"JLPT in Context" Curriculum', included: true },
            { title: 'Access to Exclusive Events and Meet Ups', included: true },
        ],
    },
];

const MotionCard = motion(Card);

export const SubscriptionPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState<string>('monthly');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSelectPlan = async (planId: string) => {
        setSelectedPlan(planId);
        setError('');
        setLoading(true);

        try {
            const stripe = await stripePromise;
            if (!stripe) {
                throw new Error('Stripe failed to load');
            }

            const plan = plans.find(p => p.id === planId);
            if (!plan) {
                throw new Error('Invalid plan selected');
            }

            // Create checkout session
            const response = await api.post('/payment/create-checkout-session', {
                priceId: plan.stripePriceId,
                mode: plan.period === 'one-time' ? 'payment' : 'subscription',
                successUrl: `${window.location.origin}/classroom`,
                cancelUrl: `${window.location.origin}/subscription`,
                metadata: {
                    plan: planId
                },
            });

            // Redirect to Stripe Checkout
            const result = await stripe.redirectToCheckout({
                sessionId: response.data.sessionId,
            });

            if (result.error) {
                throw new Error(result.error.message);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to process payment');
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ja-JP', {
            style: 'currency',
            currency: 'JPY',
        }).format(price);
    };

    const getPlanIcon = (planId: string) => {
        switch (planId) {
            case 'one-time':
                return <Person sx={{ fontSize: 40, color: 'white' }} />;
            case 'monthly':
                return <CalendarMonth sx={{ fontSize: 40, color: 'white' }} />;
            case 'yearly':
                return <School sx={{ fontSize: 40, color: 'white' }} />;
            default:
                return <School sx={{ fontSize: 40, color: 'white' }} />;
        }
    };

    const getPlanColor = (planId: string) => {
        switch (planId) {
            case 'one-time':
                return { primary: '#FF6B6B', secondary: '#FFB7C5' };
            case 'monthly':
                return { primary: '#4ECDC4', secondary: '#7ED4D0' };
            case 'yearly':
                return { primary: '#00B894', secondary: '#00D4AA' };
            default:
                return { primary: '#FF6B6B', secondary: '#FFB7C5' };
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
                py: 4,
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Background decoration - matching other pages */}
            <Box
                sx={{
                    position: 'absolute',
                    top: -200,
                    right: -200,
                    width: 400,
                    height: 400,
                    borderRadius: '50%',
                    background: 'rgba(255, 107, 107, 0.1)',
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
                    background: 'rgba(78, 205, 196, 0.05)',
                }}
            />

            <Container maxWidth="xl">
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/classroom')}
                    sx={{
                        mb: 3,
                        '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.04)',
                        },
                    }}
                >
                    Back to Classroom
                </Button>

                {/* Header Section */}
                <Box textAlign="center" mb={15}>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Typography variant="h3" fontWeight={700} gutterBottom>
                            Choose Your Learning Journey
                        </Typography>
                        {/* <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
                            3 different options to match your learning goals!
                        </Typography>
                        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                            <Typography variant="body1" color="text.secondary">
                                Thrive in Japan goes
                            </Typography>
                            <Chip
                                label="LIVE"
                                color="error"
                                size="small"
                                sx={{
                                    fontWeight: 700,
                                    fontStyle: 'italic',
                                    animation: 'pulse 2s infinite',
                                    '@keyframes pulse': {
                                        '0%': { transform: 'scale(1)' },
                                        '50%': { transform: 'scale(1.05)' },
                                        '100%': { transform: 'scale(1)' },
                                    },
                                }}
                            />
                            <Typography variant="body1" color="text.secondary">
                                on
                            </Typography>
                            <Typography variant="body1" color="error" fontWeight={700}>
                                August 1st, 2025
                            </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                            Special discounted pricing available until October 31st
                        </Typography> */}
                    </motion.div>
                </Box>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Alert
                            severity="error"
                            sx={{ mb: 3, maxWidth: 'lg', mx: 'auto' }}
                            onClose={() => setError('')}
                        >
                            {error}
                        </Alert>
                    </motion.div>
                )}

                {/* Plans Grid */}
                <Stack
                    direction={{ xs: 'column', lg: 'row' }}
                    spacing={3}
                    alignItems="stretch"
                    sx={{ maxWidth: 'lg', mx: 'auto' }}
                >
                    {plans.map((plan, index) => {
                        const colors = getPlanColor(plan.id);
                        return (
                            <MotionCard
                                key={plan.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                sx={{
                                    flex: 1,
                                    position: 'relative',
                                    overflow: 'visible',
                                    borderRadius: "20px",
                                    borderColor: 'primary.main',
                                    border: 'none',
                                    boxShadow: 2,
                                    // border: plan.recommended ? '2px solid' : 'none',
                                    // boxShadow: plan.recommended ? 8 : 2,
                                }}
                            >
                                {/* Recommended Badge */}
                                {/* {plan.recommended && (
                                    <motion.div
                                        // initial={{ scale: 0 }}
                                        // animate={{ scale: 1 }}
                                        transition={{ delay: 0.3, type: "spring" }}
                                    >
                                        <Chip
                                            label="MOST POPULAR"
                                            color="error"
                                            size="small"
                                            sx={{
                                                position: 'absolute',
                                                top: -12,
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                fontWeight: 600,
                                                zIndex: 1,
                                                px: 2,
                                            }}
                                        />
                                    </motion.div>
                                )} */}

                                {/* Plan Header */}
                                <Box
                                    sx={{
                                        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                                        color: 'white',
                                        py: 3,
                                        borderRadius: "18px",
                                        textAlign: 'center',
                                        position: 'relative',
                                    }}
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2 + index * 0.1, type: "spring" }}
                                    >
                                        <Box
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                borderRadius: '50%',
                                                background: 'rgba(255, 255, 255, 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mx: 'auto',
                                                mb: 2,
                                            }}
                                        >
                                            {getPlanIcon(plan.id)}
                                        </Box>
                                    </motion.div>
                                    <Typography variant="h5" fontWeight={600}>
                                        {plan.name}
                                    </Typography>
                                </Box>

                                <CardContent sx={{ p: 4 }}>
                                    {/* Features List */}
                                    <Stack spacing={2} sx={{ minHeight: 200 }}>
                                        {plan.features.map((feature, featureIndex) => (
                                            <motion.div
                                                key={featureIndex}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3 + index * 0.1 + featureIndex * 0.05 }}
                                            >
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    {feature.included ? (
                                                        <Check sx={{ color: 'success.main', fontSize: 20 }} />
                                                    ) : (
                                                        <Close sx={{ color: 'error.main', fontSize: 20 }} />
                                                    )}
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            textDecoration: feature.included ? 'none' : 'line-through',
                                                            color: feature.included ? 'text.primary' : 'text.secondary',
                                                        }}
                                                    >
                                                        {feature.title}
                                                    </Typography>
                                                </Stack>
                                            </motion.div>
                                        ))}
                                    </Stack>

                                    {/* Price Section */}
                                    <Box textAlign="center" sx={{ mt: 4, mb: 3 }}>
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.5 + index * 0.1 }}
                                        >
                                            <Typography
                                                variant="h3"
                                                fontWeight={700}
                                                sx={{ color: colors.primary }}
                                            >
                                                {formatPrice(plan.price)}
                                            </Typography>
                                            {plan.period !== 'one-time' && (
                                                <Typography variant="body2" color="text.secondary">
                                                    per {plan.period}
                                                </Typography>
                                            )}
                                        </motion.div>
                                    </Box>

                                    {/* CTA Button */}
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        onClick={() => handleSelectPlan(plan.id)}
                                        disabled={loading && selectedPlan === plan.id}
                                        sx={{
                                            py: 1.5,
                                            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                                            color: 'white',
                                            fontWeight: 600,
                                            '&:hover': {
                                                background: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.primary} 100%)`,
                                            },
                                            '&:disabled': {
                                                background: 'rgba(0, 0, 0, 0.12)',
                                            },
                                        }}
                                    >
                                        {loading && selectedPlan === plan.id ? (
                                            <CircularProgress size={24} color="inherit" />
                                        ) : (
                                            '14-Day Free Trial'
                                        )}
                                    </Button>
                                </CardContent>
                            </MotionCard>
                        );
                    })}
                </Stack>

                {/* Additional Info */}
                {/* <Box sx={{ mt: 6, textAlign: 'center' }}>
                    <Paper
                        sx={{
                            p: 3,
                            maxWidth: 600,
                            mx: 'auto',
                            background: 'rgba(255, 107, 107, 0.05)',
                            border: '1px solid',
                            borderColor: 'rgba(255, 107, 107, 0.2)',
                        }}
                    >
                        <Stack spacing={2}>
                            <Typography variant="h6" fontWeight={600}>
                                Need help choosing?
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                All plans include access to our comprehensive learning platform.
                                The monthly and yearly subscriptions offer the most value with unlimited speaking sessions.
                            </Typography>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/contact')}
                            >
                                Contact Support
                            </Button>
                        </Stack>
                    </Paper>
                </Box> */}
            </Container>
        </Box>
    );
};