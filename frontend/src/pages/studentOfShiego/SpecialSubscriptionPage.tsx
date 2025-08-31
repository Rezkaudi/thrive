// frontend/src/pages/SubscriptionPage.tsx
import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Stack,
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
    Timer
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { AppDispatch } from '../../store/store';
import { useDispatch } from 'react-redux';
import { paymentService, DiscountStatus } from '../../services/paymentService';
import { logout } from '../../store/slices/authSlice';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY!);
interface PlanOption {
    id: string;
    name: string;
    regularPrice: number;
    discountedPrice: number;
    currency: string;
    period: string;
    features: {
        title: string;
        included: boolean;
    }[];
    recommended?: boolean;
    savings?: number;
}

const plans: PlanOption[] = [
    // {
    //     id: 'one-time',
    //     name: 'Japan in Context Premiere',
    //     price: 2500,
    //     currency: '$',
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
        id: 'monthlySpecial',
        name: 'Monthly Subscription',
        regularPrice: 8800,
        discountedPrice: 0,
        currency: '¥',
        period: 'month',
        recommended: true,
        // savings: 30,
        features: [
            { title: 'Thrive in Japan Platform', included: true },
            { title: 'Unlimited Speaking Sessions', included: true },
            { title: '"Japan in Context" Curriculum', included: true },
            { title: '"JLPT in Context" Curriculum', included: true },
            { title: 'Access to Exclusive Events and Meet Ups', included: true },
        ],
    },
    // {
    //     id: 'yearly',
    //     name: 'Yearly Subscription',
    //     regularPrice: 2000,
    //     discountedPrice: 1400,
    //     currency: '$',
    //     period: 'year',
    //     savings: 30,
    //     features: [
    //         { title: 'Thrive in Japan Platform', included: true },
    //         { title: 'Unlimited Speaking Sessions', included: true },
    //         { title: '"Japan in Context" Curriculum', included: true },
    //         { title: '"JLPT in Context" Curriculum', included: true },
    //         { title: 'Access to Exclusive Events and Meet Ups', included: true },
    //     ],
    // },
];

const MotionCard = motion(Card);

export const SpecialSubscriptionPage: React.FC = () => {
    // const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState<string>('monthlySpecial');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [discountStatus, setDiscountStatus] = useState<DiscountStatus | null>(null);
    const [loadingDiscount, setLoadingDiscount] = useState(true);
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        fetchDiscountStatus();
        // Refresh discount status every 30 seconds
        // const interval = setInterval(fetchDiscountStatus, 30000);
        // return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        dispatch(logout());
    };

    const fetchDiscountStatus = async () => {
        try {
            // const status = await paymentService.checkDiscountStatus();
            setDiscountStatus(
                { "isEligible": false, "remainingSpots": 100, "totalUsed": 100, "limit": 100 }
            );
        } catch (err) {
            console.error('Failed to fetch discount status:', err);
        } finally {
            setLoadingDiscount(false);
        }
    };

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

            // Create checkout session with discount check
            const response = await paymentService.createCheckoutSession({
                planType: planId as 'monthly' | 'yearly' | 'monthlySpecial',
                mode: 'subscription',
                successUrl: `${window.location.origin}/dashboard`,
                cancelUrl: `${window.location.origin}/student-of-shiego/subscription`,
                metadata: {
                    plan: planId,
                    hasTrial: false
                },
            });

            // Redirect to Stripe Checkout
            const result = await stripe.redirectToCheckout({
                sessionId: response.sessionId,
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
            case 'monthly':
                return { primary: '#A6531C', secondary: '#483C32' };
            case 'yearly':
                return { primary: '#5C633A', secondary: '#283618' };
            default:
                return { primary: '#5C633A', secondary: '#D4BC8C' };
        }
    };

    const isDiscountActive = discountStatus?.isEligible ?? false;

    if (loadingDiscount) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

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
            {/* Background decoration */}
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
                    onClick={handleLogout}
                    sx={{
                        mb: 3,
                        '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.04)',
                        },
                    }}
                >
                    {/* Back */}
                </Button>

                {/* Header Section with Discount Alert */}
                <Box textAlign="center" sx={{ mb: 4 }}>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Typography variant="h3" fontWeight={700} gutterBottom>
                            Choose Your Learning Journey
                        </Typography>
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

                {/* Countdown Timer for Discount */}
                {isDiscountActive && !loadingDiscount && (
                    <Box sx={{ textAlign: 'center', mb: 10 }}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                                <Timer sx={{ color: 'error.main' }} />
                                <Typography variant="body1" color="error.main" fontWeight={600}>
                                    Limited time offer ends when all {discountStatus?.limit} spots are filled
                                </Typography>
                            </Stack>
                        </motion.div>
                    </Box>
                )}

                {/* Plans Grid */}
                <Stack
                    direction={{ xs: 'column', lg: 'row' }}
                    spacing={3}
                    alignItems="stretch"
                    sx={{ maxWidth: 'sm', mx: 'auto', gap: { xs: "90px 0", lg: "0" } }}
                >
                    {plans.map((plan, index) => {
                        const colors = getPlanColor(plan.id);
                        const currentPrice = isDiscountActive ? plan.discountedPrice : plan.regularPrice;
                        const showDiscount = isDiscountActive && plan.discountedPrice < plan.regularPrice;

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
                                    // border: plan.recommended ? '2px solid' : 'none',
                                    // borderColor: plan.recommended ? 'primary.main' : 'transparent',
                                    // boxShadow: plan.recommended ? 8 : 2,
                                }}
                            >


                                {/* Discount Badge */}
                                {showDiscount && (
                                    <motion.div
                                        initial={{ scale: 0, rotate: -15 }}
                                        animate={{ scale: 1, rotate: -15 }}
                                        transition={{ delay: 0.4, type: "spring" }}
                                    >
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: { xs: -15, md: 60, lg: 20 },
                                                right: -10,
                                                bgcolor: 'error.main',
                                                color: 'white',
                                                px: 2,
                                                py: 0.5,
                                                borderRadius: 2,
                                                fontWeight: 700,
                                                fontSize: '0.875rem',
                                                boxShadow: 3,
                                                zIndex: 1,
                                            }}
                                        >
                                            SAVE {plan.savings}%
                                        </Box>
                                    </motion.div>
                                )}

                                {/* Plan Header */}
                                <Box
                                    sx={{
                                        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                                        color: 'white',
                                        py: 3,
                                        borderRadius: "18px 18px 0 0",
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
                                    {/* Price Section */}
                                    <Box textAlign="center" sx={{ mb: 4 }}>
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.5 + index * 0.1 }}
                                        >
                                            {showDiscount && (
                                                <Typography
                                                    variant="h5"
                                                    sx={{
                                                        textDecoration: 'line-through',
                                                        color: 'text.secondary',
                                                        mb: 1,
                                                    }}
                                                >
                                                    {formatPrice(plan.regularPrice)}
                                                </Typography>
                                            )}
                                            <Typography
                                                variant="h3"
                                                fontWeight={700}
                                                sx={{ color: showDiscount ? 'error.main' : colors.primary }}
                                            >
                                                {formatPrice(currentPrice)}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                per {plan.period}
                                            </Typography>
                                        </motion.div>
                                    </Box>

                                    {/* Features List */}
                                    <Stack spacing={2} sx={{ mb: 4 }}>
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
                                                            fontWeight: feature.title.includes('FREE') ? 600 : 400,
                                                        }}
                                                    >
                                                        {feature.title}
                                                    </Typography>
                                                </Stack>
                                            </motion.div>
                                        ))}
                                    </Stack>

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
                                            position: 'relative',
                                            overflow: 'hidden',
                                            '&:hover': {
                                                background: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.primary} 100%)`,
                                            },
                                            '&:disabled': {
                                                background: 'rgba(0, 0, 0, 0.12)',
                                            },
                                        }}
                                    >
                                        <AnimatePresence mode="wait">
                                            {loading && selectedPlan === plan.id ? (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                >
                                                    <CircularProgress size={24} color="inherit" />
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                >
                                                    {showDiscount ? (
                                                        <Stack spacing={0.5}>
                                                            <Typography variant="button">
                                                                Claim Your Discount
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                                                {'Subscribe Now'}
                                                            </Typography>
                                                        </Stack>
                                                    ) : (
                                                        'Subscribe Now'
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </Button>
                                </CardContent>
                            </MotionCard>
                        );
                    })}
                </Stack>

            </Container>
        </Box>
    );
};
