// frontend/src/components/payment/PaymentForm.tsx
import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    CircularProgress,
    Alert,
} from '@mui/material';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import api from '../../services/api';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY!);

interface InnerPaymentFormProps {
    email?: string;
    showEmailField?: boolean;
    onSuccess: (paymentIntentId: string) => void;
}

const InnerPaymentForm: React.FC<InnerPaymentFormProps> = ({ email: initialEmail = '', showEmailField = true, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [email, setEmail] = useState(initialEmail);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setLoading(true);
        setError(null);

        try {
            const { data } = await api.post('/payment/create-payment-intent', {
                amount: 5000,
                currency: 'usd',
            });

            const result = await stripe.confirmCardPayment(data.clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement)!,
                    billing_details: {
                        email,
                    },
                },
            });

            if (result.error) {
                setError(result.error.message || 'Payment failed');
            } else {
                await api.post('/auth/register', {
                    email,
                    stripePaymentIntentId: result.paymentIntent.id,
                });

                onSuccess(result.paymentIntent.id);
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.error?.message ||
                err.response?.data?.error ||
                err.message ||
                'An error occurred';

            if (errorMessage.includes('User already exists')) {
                setError('This email is already registered. Please login instead or use a different email.');
            } else {
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {showEmailField && (
                <TextField
                    fullWidth
                    type="email"
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    sx={{ mb: 3 }}
                />
            )}

            <Box
                sx={{
                    p: 2,
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    mb: 3,
                }}
            >
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                        },
                    }}
                />
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={!stripe || loading}
            >
                {loading ? <CircularProgress size={24} /> : 'Pay $5,000'}
            </Button>
        </form>
    );
};

interface PaymentFormProps {
    email?: string;
    showEmailField?: boolean;
    onSuccess: (paymentIntentId: string) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = (props) => (
    <Elements stripe={stripePromise}>
        <InnerPaymentForm {...props} />
    </Elements>
);
