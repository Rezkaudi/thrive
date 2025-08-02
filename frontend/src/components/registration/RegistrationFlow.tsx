// frontend/src/components/registration/RegistrationFlow.tsx
import React, { useState } from 'react';
import {
    Box,
    Stepper,
    Step,
    StepLabel,
    Card,
    CardContent,
    Typography,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { EmailVerification } from './steps/EmailVerification';
import { PaymentStep } from './steps/PaymentStep';
import { UserInfoStep } from './steps/UserInfoStep';
import { RegistrationComplete } from './steps/RegistrationComplete';

interface RegistrationData {
    email: string;
    verificationCode?: string;
    paymentIntentId?: string;
    name?: string;
    password?: string;
}

interface RegistrationFlowProps {
    onStepChange?: (step: number) => void;
}

const steps = ['Verify Email', 'Payment', 'Create Account', 'Complete'];

export const RegistrationFlow: React.FC<RegistrationFlowProps> = ({ onStepChange }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [registrationData, setRegistrationData] = useState<RegistrationData>({
        email: '',
    });

    // Call onStepChange whenever step changes
    React.useEffect(() => {
        onStepChange?.(activeStep);
    }, [activeStep, onStepChange]);


    const handleNext = (data: Partial<RegistrationData>) => {
        setRegistrationData({ ...registrationData, ...data });
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const getStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <EmailVerification
                        onNext={handleNext}
                        email={registrationData.email}
                    />
                );
            case 1:
                return (
                    <PaymentStep
                        email={registrationData.email}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                );
            case 2:
                return (
                    <UserInfoStep
                        email={registrationData.email}
                        paymentIntentId={registrationData.paymentIntentId!}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                );
            case 3:
                return <RegistrationComplete />;
            default:
                return null;
        }
    };

    return (
        <Card sx={{ boxShadow: 10 }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                {/* Logo and Title */}
                <Box textAlign="center" mb={4}>
                    <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
                        Welcome to Thrive in Japan 🌸
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Join thousands learning Japanese with cultural context
                    </Typography>
                </Box>

                {/* Stepper */}
                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
                    {steps.map((label, index) => (
                        <Step key={label}>
                            <StepLabel
                                sx={{
                                    '& .MuiStepLabel-label': {
                                        fontSize: '0.875rem',
                                        fontWeight: activeStep === index ? 600 : 400,
                                    },
                                    '& .MuiStepIcon-root.Mui-active': {
                                        color: '#5C633A',
                                    },
                                    '& .MuiStepIcon-root.Mui-completed': {
                                        color: '#483C32',
                                    },
                                }}
                            >
                                {label}
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeStep}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                    >
                        {getStepContent()}
                    </motion.div>
                </AnimatePresence>
            </CardContent>
        </Card>
    );
};