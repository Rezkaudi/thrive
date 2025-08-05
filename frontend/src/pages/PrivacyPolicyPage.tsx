// frontend/src/pages/PrivacyPolicyPage.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Stack,
    Card,
    CardContent,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    IconButton,
    Tooltip,
    Grid,
    ListItemButton,
} from '@mui/material';
import {
    ArrowBack,
    Shield,
    Lock,
    Visibility,
    Storage,
    Share,
    Security,
    ContactMail,
    Update,
    CheckCircle,
    Home,
    Print,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const sections = [
    { id: 'introduction', title: 'Introduction', icon: <Shield /> },
    { id: 'information-collection', title: 'Information We Collect', icon: <Storage /> },
    { id: 'use-of-information', title: 'How We Use Your Information', icon: <Visibility /> },
    { id: 'sharing', title: 'Information Sharing', icon: <Share /> },
    { id: 'security', title: 'Data Security', icon: <Lock /> },
    { id: 'rights', title: 'Your Rights', icon: <Security /> },
    { id: 'contact', title: 'Contact Us', icon: <ContactMail /> },
];

export const PrivacyPolicyPage: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Header */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #5C633A 0%, #D4BC8C 50%, #A6531C 100%)',
                    color: 'white',
                    py: 8,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Background decoration */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -100,
                        right: -100,
                        width: 300,
                        height: 300,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.1)',
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: -150,
                        left: -150,
                        width: 400,
                        height: 400,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.05)',
                    }}
                />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                        <Button
                            startIcon={<ArrowBack />}
                            onClick={() => navigate('/dashboard')}
                            sx={{ color: 'white' }}
                        >
                            Back
                        </Button>
                        {/* <Stack direction="row" spacing={1}>
                            <Tooltip title="Print">
                                <IconButton onClick={handlePrint} sx={{ color: 'white' }}>
                                    <Print />
                                </IconButton>
                            </Tooltip>
                            <Button
                                startIcon={<Home />}
                                onClick={() => navigate('/dashboard')}
                                sx={{ color: 'white' }}
                            >
                                Dashboard
                            </Button>
                        </Stack> */}
                    </Stack>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Box textAlign="center">
                            <Typography variant="h2" fontWeight={700} gutterBottom>
                                Privacy Policy
                            </Typography>
                            <Typography variant="h5" sx={{ opacity: 0.9 }}>
                                Your privacy is important to us
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 2, opacity: 0.8 }}>
                                Last updated: August 2, 2025
                            </Typography>
                        </Box>
                    </motion.div>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: 6 }}>
                <Grid container spacing={4}>
                    {/* Table of Contents */}
                    <Grid size={{ xs: 12, md: 3 }}>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <Card
                                sx={{
                                    position: { md: 'sticky' },
                                    top: { md: 24 },
                                    mb: 4,
                                }}
                            >
                                <CardContent>
                                    <Typography variant="h6" fontWeight={600} gutterBottom>
                                        Table of Contents
                                    </Typography>
                                    <List>
                                        {sections.map((section) => (
                                            <ListItem key={section.id} disablePadding>
                                                <ListItemButton
                                                    onClick={() => scrollToSection(section.id)}
                                                    sx={{
                                                        borderRadius: 1,
                                                        mb: 0.5,
                                                        '&:hover': {
                                                            bgcolor: 'action.hover',
                                                        },
                                                    }}
                                                >
                                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                                        {section.icon}
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={section.title}
                                                        primaryTypographyProps={{
                                                            variant: 'body2',
                                                            fontWeight: 500,
                                                        }}
                                                    />
                                                </ListItemButton>
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>

                    {/* Content */}
                    <Grid size={{ xs: 12, md: 9 }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <Stack spacing={6}>
                                {/* Introduction */}
                                <Paper id="introduction" sx={{ p: 4 }}>
                                    <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                                        <Shield color="primary" />
                                        <Typography variant="h4" fontWeight={600}>
                                            Introduction
                                        </Typography>
                                    </Stack>
                                    <Typography variant="body1" paragraph>
                                        Welcome to Thrive in Japan ("we," "our," or "us"). We are committed to protecting
                                        your personal information and your right to privacy. This Privacy Policy explains
                                        how we collect, use, disclose, and safeguard your information when you use our
                                        website and services.
                                    </Typography>
                                    <Typography variant="body1" paragraph>
                                        Please read this privacy policy carefully. If you do not agree with the terms of
                                        this privacy policy, please do not access the site or use our services.
                                    </Typography>
                                </Paper>

                                {/* Information We Collect */}
                                <Paper id="information-collection" sx={{ p: 4 }}>
                                    <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                                        <Storage color="primary" />
                                        <Typography variant="h4" fontWeight={600}>
                                            Information We Collect
                                        </Typography>
                                    </Stack>
                                    <Typography variant="h6" fontWeight={500} gutterBottom sx={{ mt: 3 }}>
                                        Personal Information
                                    </Typography>
                                    <List>
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckCircle color="success" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Account Information"
                                                secondary="Name, email address, password, and profile picture"
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckCircle color="success" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Payment Information"
                                                secondary="Credit card details, billing address (processed securely through Stripe)"
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckCircle color="success" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Learning Data"
                                                secondary="Course progress, quiz scores, session attendance, and language level"
                                            />
                                        </ListItem>
                                    </List>

                                    <Typography variant="h6" fontWeight={500} gutterBottom sx={{ mt: 3 }}>
                                        Automatically Collected Information
                                    </Typography>
                                    <List>
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckCircle color="success" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Device Information"
                                                secondary="IP address, browser type, operating system"
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckCircle color="success" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Usage Data"
                                                secondary="Pages visited, time spent, features used"
                                            />
                                        </ListItem>
                                    </List>
                                </Paper>

                                {/* How We Use Your Information */}
                                <Paper id="use-of-information" sx={{ p: 4 }}>
                                    <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                                        <Visibility color="primary" />
                                        <Typography variant="h4" fontWeight={600}>
                                            How We Use Your Information
                                        </Typography>
                                    </Stack>
                                    <Typography variant="body1" paragraph>
                                        We use your information to:
                                    </Typography>
                                    <List>
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckCircle color="success" />
                                            </ListItemIcon>
                                            <ListItemText primary="Provide and maintain our educational services" />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckCircle color="success" />
                                            </ListItemIcon>
                                            <ListItemText primary="Process your payments and manage subscriptions" />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckCircle color="success" />
                                            </ListItemIcon>
                                            <ListItemText primary="Track your learning progress and provide personalized recommendations" />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckCircle color="success" />
                                            </ListItemIcon>
                                            <ListItemText primary="Send you important updates about your account and our services" />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckCircle color="success" />
                                            </ListItemIcon>
                                            <ListItemText primary="Improve our platform and develop new features" />
                                        </ListItem>
                                    </List>
                                </Paper>

                                {/* Information Sharing */}
                                <Paper id="sharing" sx={{ p: 4 }}>
                                    <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                                        <Share color="primary" />
                                        <Typography variant="h4" fontWeight={600}>
                                            Information Sharing
                                        </Typography>
                                    </Stack>
                                    <Typography variant="body1" paragraph>
                                        We do not sell, trade, or rent your personal information to third parties.
                                        We may share your information only in the following situations:
                                    </Typography>
                                    <List>
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckCircle color="success" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Service Providers"
                                                secondary="With trusted third-party services like Stripe for payment processing"
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckCircle color="success" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Legal Requirements"
                                                secondary="When required by law or to protect our rights"
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckCircle color="success" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="With Your Consent"
                                                secondary="When you explicitly agree to share information"
                                            />
                                        </ListItem>
                                    </List>
                                </Paper>

                                {/* Data Security */}
                                <Paper id="security" sx={{ p: 4 }}>
                                    <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                                        <Lock color="primary" />
                                        <Typography variant="h4" fontWeight={600}>
                                            Data Security
                                        </Typography>
                                    </Stack>
                                    <Typography variant="body1" paragraph>
                                        We implement appropriate technical and organizational security measures to protect
                                        your personal information, including:
                                    </Typography>
                                    <List>
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckCircle color="success" />
                                            </ListItemIcon>
                                            <ListItemText primary="Encryption of sensitive data in transit and at rest" />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckCircle color="success" />
                                            </ListItemIcon>
                                            <ListItemText primary="Regular security assessments and updates" />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckCircle color="success" />
                                            </ListItemIcon>
                                            <ListItemText primary="Limited access to personal data on a need-to-know basis" />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckCircle color="success" />
                                            </ListItemIcon>
                                            <ListItemText primary="Secure data centers and backup procedures" />
                                        </ListItem>
                                    </List>
                                </Paper>

                                {/* Your Rights */}
                                <Paper id="rights" sx={{ p: 4 }}>
                                    <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                                        <Security color="primary" />
                                        <Typography variant="h4" fontWeight={600}>
                                            Your Rights
                                        </Typography>
                                    </Stack>
                                    <Typography variant="body1" paragraph>
                                        You have the following rights regarding your personal information:
                                    </Typography>
                                    <List>
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckCircle color="success" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Access"
                                                secondary="Request a copy of your personal data"
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckCircle color="success" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Correction"
                                                secondary="Update or correct inaccurate information"
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckCircle color="success" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Deletion"
                                                secondary="Request deletion of your account and personal data"
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <CheckCircle color="success" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Portability"
                                                secondary="Receive your data in a portable format"
                                            />
                                        </ListItem>
                                    </List>
                                </Paper>

                                {/* Contact Us */}
                                <Paper id="contact" sx={{ p: 4 }}>
                                    <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                                        <ContactMail color="primary" />
                                        <Typography variant="h4" fontWeight={600}>
                                            Contact Us
                                        </Typography>
                                    </Stack>
                                    <Typography variant="body1" paragraph>
                                        If you have any questions about this Privacy Policy or our data practices,
                                        please contact us at:
                                    </Typography>
                                    <Box sx={{ bgcolor: 'grey.50', p: 3, borderRadius: 2 }}>
                                        <Typography variant="body1" fontWeight={600}>
                                            Thrive in Japan
                                        </Typography>
                                        <Typography variant="body1">
                                            Email: privacy@thriveinjapan.com
                                        </Typography>
                                        <Typography variant="body1">
                                            Address: Tokyo, Japan
                                        </Typography>
                                    </Box>
                                </Paper>

                                {/* Updates */}
                                <Paper sx={{ p: 4, bgcolor: 'primary.light' }}>
                                    <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                                        <Update color="primary" />
                                        <Typography variant="h6" fontWeight={600}>
                                            Policy Updates
                                        </Typography>
                                    </Stack>
                                    <Typography variant="body2">
                                        We may update this Privacy Policy from time to time. We will notify you of any
                                        changes by posting the new Privacy Policy on this page and updating the "Last
                                        updated" date at the top of this policy.
                                    </Typography>
                                </Paper>
                            </Stack>
                        </motion.div>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};