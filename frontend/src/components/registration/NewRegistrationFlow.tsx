// frontend/src/components/registration/NewRegistrationFlow.tsx
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
import { UserInfoForm } from './steps/UserInfoForm';
import { EmailVerificationStep } from './steps/EmailVerificationStep';
import { RegistrationSuccess } from './steps/RegistrationSuccess';

interface RegistrationData {
    name: string;
    email: string;
    password: string;
}

const steps = ['Create Account', 'Verify Email', 'Success'];

export const NewRegistrationFlow: React.FC = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [registrationData, setRegistrationData] = useState<RegistrationData>({
        name: '',
        email: '',
        password: '',
    });

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
                    <UserInfoForm
                        onNext={handleNext}
                        initialData={registrationData}
                    />
                );
            case 1:
                return (
                    <EmailVerificationStep
                        email={registrationData.email}
                        password={registrationData.password}
                        name={registrationData.name}
                        onNext={() => setActiveStep(2)}
                        onBack={handleBack}
                    />
                );
            case 2:
                return <RegistrationSuccess />;
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
                        Join Thrive in Japan 🌸
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Start your Japanese learning journey today
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
                                        color: '#FF6B6B',
                                    },
                                    '& .MuiStepIcon-root.Mui-completed': {
                                        color: '#00B894',
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