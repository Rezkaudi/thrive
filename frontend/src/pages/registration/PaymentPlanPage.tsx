// frontend/src/pages/registration/PaymentPlanPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    CardContent,
    Typography,
    Button,
    Stack,
    Paper,
    Chip,
    Alert,
    CircularProgress,
} from '@mui/material';
import { ArrowBack, Check, Close } from '@mui/icons-material';
import { loadStripe } from '@stripe/stripe-js';
import api from '../../services/api';

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
    {
        id: 'premiere',
        name: 'Japan in Context Premiere',
        price: 220000,
        currency: '¥',
        period: 'one-time',
        stripePriceId: process.env.REACT_APP_STRIPE_ONE_TIME_PRICE_ID || 'price_premiere',
        features: [
            { title: 'Thrive in Japan Platform', included: true },
            { title: 'Speaking Sessions', included: false },
            { title: '"Japan in Context" Curriculum', included: true },
            { title: '"JLPT in Context" Curriculum', included: false },
            { title: 'Access to Exclusive Events and Meet Ups', included: true },
            { title: '1-on-1 JCT Certified Personal Coaching', included: true },
        ],
    },
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

export const PaymentPlanPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState<string>('monthly');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Check if user completed email verification
        const email = sessionStorage.getItem('registration_email');
        if (!email) {
            navigate('/register/email');
        }
    }, [navigate]);

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
                successUrl: `${window.location.origin}/register/account?session_id={CHECKOUT_SESSION_ID}`,
                cancelUrl: `${window.location.origin}/register/payment`,
                metadata: {
                    email: sessionStorage.getItem('registration_email'),
                    plan: planId,
                },
            });

            // Store plan selection
            sessionStorage.setItem('registration_plan', planId);
            sessionStorage.setItem('registration_step', '2');

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

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(    135deg, #f5f5f5 0%, #e0e0e0 100%)',
                py: 4,
                // background: 'linear-gradient(135deg, #FF6B6B 0%, #FFB7C5 100%)',
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
            <Container maxWidth="lg">
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/register/email')}
                    sx={{ mb: 3 }}
                >
                    Back to Email Verification
                </Button>

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
                        Step 2 of 4: Choose Your Plan
                    </Typography>
                </Box>

                <Box textAlign="center" mb={6}>
                    <Typography variant="h3" fontWeight={700} gutterBottom>
                        3 different options to match your learning goals!
                    </Typography>
                    <Typography variant="h5" color="text.secondary" mb={2}>
                        Thrive in Japan goes <Box component="span" sx={{ color: 'error.main', fontWeight: 700, fontStyle: 'italic' }}>LIVE</Box> on{' '}
                        <Box component="span" sx={{ color: 'error.main', fontWeight: 700 }}>August 1st, 2025</Box>{' '}
                        Don't miss your chance to join at a special discounted price!
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        <Box component="span" sx={{ fontStyle: 'italic' }}>After October 31st, this will be the regular price for the program</Box> ↓
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="stretch">
                    {plans.map((plan) => (
                        <Paper
                            key={plan.id}
                            elevation={plan.recommended ? 8 : 2}
                            sx={{
                                flex: 1,
                                position: 'relative',
                                borderRadius: 2,
                                overflow: 'hidden',
                                border: plan.recommended ? '2px solid' : 'none',
                                borderColor: 'primary.main',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 10,
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    backgroundColor: plan.id === 'premiere' ? '#c62828' : plan.id === 'monthly' ? '#2d2d2d' : '#b8860b',
                                    color: 'white',
                                    py: 2,
                                    textAlign: 'center',
                                }}
                            >
                                <Typography variant="h5" fontWeight={600}>
                                    {plan.name}
                                </Typography>
                                {plan.recommended && (
                                    <Chip
                                        label="MOST POPULAR"
                                        size="small"
                                        sx={{
                                            mt: 1,
                                            backgroundColor: 'white',
                                            color: '#2d2d2d',
                                            fontWeight: 600,
                                        }}
                                    />
                                )}
                            </Box>

                            <CardContent sx={{ p: 4 }}>
                                <Stack spacing={2}>
                                    {plan.features.map((feature, index) => (
                                        <Stack key={index} direction="row" spacing={1} alignItems="center">
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
                                    ))}
                                </Stack>

                                <Box textAlign="center" mt={4}>
                                    <Typography variant="h3" fontWeight={700} color="primary">
                                        {formatPrice(plan.price)}
                                    </Typography>
                                    {plan.period !== 'one-time' && (
                                        <Typography variant="body2" color="text.secondary">
                                            per {plan.period}
                                        </Typography>
                                    )}
                                </Box>

                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    onClick={() => handleSelectPlan(plan.id)}
                                    disabled={loading && selectedPlan === plan.id}
                                    sx={{
                                        mt: 3,
                                        py: 1.5,
                                        backgroundColor: plan.id === 'premiere' ? '#c62828' : plan.id === 'monthly' ? '#2d2d2d' : '#b8860b',
                                        '&:hover': {
                                            backgroundColor: plan.id === 'premiere' ? '#d32f2f' : plan.id === 'monthly' ? '#424242' : '#d4a017',
                                        },
                                    }}
                                >
                                    {loading && selectedPlan === plan.id ? (
                                        <CircularProgress size={24} color="inherit" />
                                    ) : (
                                        'Enroll Now'
                                    )}
                                </Button>
                            </CardContent>
                        </Paper>
                    ))}
                </Stack>
            </Container>
        </Box>
    );
};