// frontend/src/components/registration/steps/UserInfoStep.tsx
import React, { useState } from 'react';
import {
    Box,
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
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../../../services/api';

interface UserInfoStepProps {
    email: string;
    paymentIntentId: string;
    onNext: (data: { name: string; password: string }) => void;
    onBack: () => void;
}

interface PasswordStrength {
    score: number;
    feedback: string[];
    color: string;
}

export const UserInfoStep: React.FC<UserInfoStepProps> = ({
    email,
    paymentIntentId,
    onNext,
    onBack,
}) => {
    const [formData, setFormData] = useState({
        name: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
        score: 0,
        feedback: [],
        color: 'error',
    });

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
            await api.post('/auth/complete-registration', {
                email,
                name: formData.name,
                password: formData.password,
                stripePaymentIntentId: paymentIntentId,
            });

            onNext({ name: formData.name, password: formData.password });
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Stack spacing={3}>
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
                    <Typography variant="body2" color="text.secondary">
                        Create your account to start learning
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                <Alert severity="success" icon={<CheckCircle />}>
                    Payment successful! Complete your profile to continue.
                </Alert>

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
        </Box>
    );
};