import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  Grid,
  CardContent,
  Fade,
  Zoom,
  Chip,
  Stack,
  Paper,
} from '@mui/material';
import { motion } from 'framer-motion';
import { School, Groups, EmojiEvents, CalendarMonth } from '@mui/icons-material';
import { PaymentModal } from '../components/payment/PaymentModal';
import { useNavigate } from 'react-router-dom';

const FeatureCard = ({ icon, title, description, delay }: any) => (
  <Zoom in={true} style={{ transitionDelay: `${delay}ms` }}>
    <Card
      sx={{
        height: '100%',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
        border: '1px solid rgba(255, 107, 107, 0.1)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #FF6B6B 0%, #FFB7C5 100%)',
        },
      }}
    >
      <CardContent sx={{ p: 4, textAlign: 'center' }}>
        <Box
          sx={{
            display: 'inline-flex',
            p: 2,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF6B6B 0%, #FFB7C5 100%)',
            color: 'white',
            mb: 3,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  </Zoom>
);

export const LandingPage: React.FC = () => {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleStartJourney = () => {
    navigate('/register');
  };

  return (
    <Box sx={{ minHeight: '100vh', background: '#fafafa' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #FF6B6B 0%, #FFB7C5 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
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
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    mb: 3,
                    fontWeight: 800,
                  }}
                >
                  Thrive in Japan
                </Typography>
                <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                  Master Japanese culture and language with our immersive learning platform
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 4 }}>
                  <Chip label="JLPT N5-N3" sx={{ background: 'rgba(255,255,255,0.2)', color: 'white' }} />
                  <Chip label="Cultural Context" sx={{ background: 'rgba(255,255,255,0.2)', color: 'white' }} />
                  <Chip label="Live Sessions" sx={{ background: 'rgba(255,255,255,0.2)', color: 'white' }} />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleStartJourney} // () => setPaymentModalOpen(true)
                    sx={{
                      background: 'white',
                      color: '#FF6B6B',
                      fontSize: '1.125rem',
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        background: '#f5f5f5',
                      },
                    }}
                  >
                    Start Your Journey
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleLogin}
                    sx={{
                      borderColor: 'rgba(255, 255, 255, 0.7)',
                      color: 'white',
                      fontSize: '1.125rem',
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        borderColor: 'white',
                        background: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    Login
                  </Button>
                </Stack>
              </motion.div>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -20,
                      right: -20,
                      width: '100%',
                      height: '100%',
                      background: 'url("/sakura-pattern.svg")',
                      opacity: 0.1,
                      backgroundSize: 'cover',
                    },
                  }}
                >
                  <Paper
                    elevation={10}
                    sx={{
                      p: 4,
                      borderRadius: 4,
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <Typography variant="h6" color="primary" gutterBottom>
                      What's Included
                    </Typography>
                    <Stack spacing={2}>
                      {[
                        'Structured video lessons',
                        'Interactive community',
                        'Live speaking practice',
                        'Progress tracking & gamification',
                        'Cultural insights & context',
                      ].map((item, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: '#FF6B6B',
                              mr: 2,
                            }}
                          />
                          <Typography color="text.primary">{item}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Fade in={true} timeout={1000}>
          <Box textAlign="center" mb={8}>
            <Typography variant="h2" gutterBottom>
              Everything You Need to Succeed
            </Typography>
            <Typography variant="h6" color="text.secondary">
              A comprehensive platform designed for your Japanese learning journey
            </Typography>
          </Box>
        </Fade>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 3 }}>
            <FeatureCard
              icon={<School sx={{ fontSize: 40 }} />}
              title="Structured Learning"
              description="Progress through carefully designed lessons covering both language and culture"
              delay={200}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FeatureCard
              icon={<Groups sx={{ fontSize: 40 }} />}
              title="Vibrant Community"
              description="Connect with fellow learners, share experiences, and practice together"
              delay={400}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FeatureCard
              icon={<EmojiEvents sx={{ fontSize: 40 }} />}
              title="Gamification"
              description="Earn points, unlock badges, and track your progress with our reward system"
              delay={600}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FeatureCard
              icon={<CalendarMonth sx={{ fontSize: 40 }} />}
              title="Live Sessions"
              description="Join speaking practice sessions and cultural events with native speakers"
              delay={800}
            />
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #4ECDC4 0%, #7ED4D0 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" gutterBottom>
            Ready to Begin?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join hundreds of learners already thriving in their Japanese journey
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleStartJourney}
            sx={{
              background: 'white',
              color: '#4ECDC4',
              fontSize: '1.125rem',
              px: 4,
              py: 1.5,
              '&:hover': {
                background: '#f5f5f5',
              },
            }}
          >
            Get Started Now
          </Button>
        </Container>
      </Box>

      <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
      />
    </Box>
  );
};