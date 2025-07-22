// frontend/src/components/registration/steps/UserInfoForm.tsx
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
    LinearProgress,
    Chip,
} from '@mui/material';
import {
    Person,
    Email,
    Lock,
    Visibility,
    VisibilityOff,
    CheckCircle,
    Cancel,
    AppRegistration,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface UserInfoFormProps {
    onNext: (data: { name: string; email: string; password: string }) => void;
    initialData: { name: string; email: string; password: string };
}

interface PasswordStrength {
    score: number;
    feedback: string[];
    color: string;
}

export const UserInfoForm: React.FC<UserInfoFormProps> = ({ onNext, initialData }) => {
    const [formData, setFormData] = useState(initialData);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.name.trim()) {
            setError('Please enter your name');
            return;
        }

        if (!formData.email.trim()) {
            setError('Please enter your email');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }

        if (passwordStrength.score < 100) {
            setError('Please create a stronger password');
            return;
        }

        if (formData.password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        onNext(formData);
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
                                background: 'linear-gradient(135deg, #FF6B6B 0%, #FFB7C5 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 3,
                            }}
                        >
                            <AppRegistration sx={{ fontSize: 40, color: 'white' }} />
                        </Box>
                    </motion.div>
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                        Create Your Account
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Let's get started with your basic information
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Stack spacing={3}>
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

                        <TextField
                            fullWidth
                            type="email"
                            label="Email Address"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Email color="action" />
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
                                                sx={{ color: "white" }}
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
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            error={!!confirmPassword && formData.password !== confirmPassword}
                            helperText={
                                confirmPassword && formData.password !== confirmPassword
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
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={
                                !formData.name ||
                                !formData.email ||
                                passwordStrength.score < 100 ||
                                formData.password !== confirmPassword
                            }
                        >
                            Continue
                        </Button>
                    </Stack>
                </form>
            </Stack>
        </Box>
    );
};