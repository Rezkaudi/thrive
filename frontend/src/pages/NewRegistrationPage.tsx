// frontend/src/pages/NewRegistrationPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box,
    Container,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton,
    Stack,
    LinearProgress,
    Chip,
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Email,
    Lock,
    Person,
    CheckCircle,
    Cancel,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../services/api';

interface PasswordStrength {
    score: number;
    feedback: string[];
    color: string;
}

export const NewRegistrationPage: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
            await api.post('/auth/register-new', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                isverifyemail: false,
            });

            // Store email for next step
            sessionStorage.setItem('registration_email', formData.email);

            // Navigate to verification page
            navigate('/register/verify');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #FF6B6B 0%, #FFB7C5 100%)',
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
                        <CardContent sx={{ p: 5 }}>
                            <Box textAlign="center" mb={4}>
                                <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
                                    Create Your Account 🌸
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Join thousands learning Japanese with cultural context
                                </Typography>
                            </Box>

                            {/* Progress Indicator */}
                            <Box sx={{ mb: 4 }}>
                                <Stack direction="row" spacing={2} justifyContent="center">
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
                                    Step 1 of 3: Account Information
                                </Typography>
                            </Box>

                            {error && (
                                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
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
                                        required
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
                                        label="Email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
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
                                            required
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
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        error={!!formData.confirmPassword && formData.password !== formData.confirmPassword}
                                        helperText={
                                            formData.confirmPassword && formData.password !== formData.confirmPassword
                                                ? 'Passwords do not match'
                                                : ''
                                        }
                                        required
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
                                        disabled={loading || !formData.name || passwordStrength.score < 100 || formData.password !== formData.confirmPassword}
                                        sx={{ py: 1.5 }}
                                    >
                                        {loading ? <CircularProgress size={24} /> : 'Continue to Verification'}
                                    </Button>
                                </Stack>
                            </form>

                            <Box textAlign="center" mt={3}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Already have an account?
                                </Typography>
                                <Button
                                    component={Link}
                                    to="/login"
                                    color="primary"
                                >
                                    Login here
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </motion.div>
            </Container>
        </Box>
    );
};