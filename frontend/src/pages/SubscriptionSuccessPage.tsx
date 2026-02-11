// frontend/src/pages/SubscriptionSuccessPage.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Stack,
  Card,
  CardContent,
  Avatar,
  Chip,
  Alert,
} from "@mui/material";
import {
  CheckCircle,
  School,
  ArrowForward,
  EmojiEvents,
  VideoCall,
  Groups,
  TrendingUp,
  Celebration,
  WorkspacePremium,
  AutoAwesome,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import confetti from "canvas-confetti";
import api from "../services/api";

declare global {
  interface Window {
    dataLayer: any[];
  }
}

// Key for storing processed session IDs
const PROCESSED_SESSIONS_KEY = "processed_payment_sessions";

// Helper to get processed sessions from sessionStorage
const getProcessedSessions = (): string[] => {
  try {
    const stored = sessionStorage.getItem(PROCESSED_SESSIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Helper to mark a session as processed
const markSessionAsProcessed = (sessionId: string): void => {
  const sessions = getProcessedSessions();
  if (!sessions.includes(sessionId)) {
    sessions.push(sessionId);
    sessionStorage.setItem(PROCESSED_SESSIONS_KEY, JSON.stringify(sessions));
  }
};

// Helper to check if session was already processed
const isSessionProcessed = (sessionId: string): boolean => {
  return getProcessedSessions().includes(sessionId);
};

export const SubscriptionSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processed, setProcessed] = useState(false);

  const sessionId = searchParams.get("session_id");

  // Prevent browser back button from returning to this page
  useEffect(() => {
    // Replace the current history entry so user can't go back to this page
    window.history.replaceState(null, "", window.location.href);

    // Handle popstate (back button) - redirect to dashboard
    const handlePopState = () => {
      navigate("/dashboard", { replace: true });
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  useEffect(() => {
    const verifySession = async () => {
      // 1. Basic Validation
      if (!sessionId) {
        setError("Invalid session");
        setLoading(false);
        return;
      }

      // Check if this session was already processed (prevent revisiting)
      if (isSessionProcessed(sessionId)) {
        navigate("/dashboard", { replace: true });
        return;
      }

      if (processed) return;

      try {
        // 2. Direct API Call
        const response = await api.post("/payment/verify-checkout-session", {
          sessionId,
        });

        // 3. Process Success
        if (
          response.data.status === "paid" &&
          response.data.transactionDetails
        ) {
          const {
            transactionDetails,
            metadata,
            trialConversion,
            isFirstEverPaid,
          } = response.data;

          console.log("📊 GA4 Tracking Decision:", {
            isTrial: transactionDetails.isTrial,
            isFirstEverPaid,
            willPushToGA4: transactionDetails.isTrial || isFirstEverPaid,
          });

          // --- GTM / Data Layer Logic ---
          window.dataLayer = window.dataLayer || [];

          // Determine logic based on whether it is a Trial or Paid
          const isTrial = transactionDetails.isTrial || false;
          const currency = transactionDetails.currency || "USD";

          let eventValue = transactionDetails.value;

          // Helper: format value (divide by 100 if not JPY)
          if (currency.toUpperCase() !== "JPY") {
            eventValue = eventValue / 100;
          }

          if (isTrial) {
            // 🟢 CASE 1: FREE TRIAL (Value 0)
            const trialEventData = {
              event: "signup_free_trial",
              value: 0,
              currency: currency,
              is_trial: true,
              transaction_id: transactionDetails.transactionId,
              ecommerce: {
                transaction_id: transactionDetails.transactionId,
                value: 0, // Explicitly 0
                currency: currency,
                items: [
                  {
                    item_id: `trial_${transactionDetails.plan}`,
                    item_name: transactionDetails.name || "Free Trial",
                    item_category: "Subscription",
                    price: 0,
                    quantity: 1,
                  },
                ],
              },
              user_id: metadata?.userId || null,
              is_subscription_paid: false,
              subscription_status: "trial",
            };

            console.log("📊 DataLayer Push (Free Trial):", trialEventData);
            window.dataLayer.push(trialEventData);
          } else if (isFirstEverPaid) {
            // 🟢 CASE 2: FIRST-TIME PAID SUBSCRIPTION (fires only ONCE per user, ever)
            // This is critical for GA4 tracking - prevents duplicate events on renewal/re-subscription
            const paidEventData = {
              event: "subscription_paid",
              value: eventValue,
              currency: currency,
              subscription_plan: transactionDetails.plan,
              subscription_name: transactionDetails.name,
              billing_interval: transactionDetails.interval || "monthly",
              is_trial: false,
              transaction_id: transactionDetails.transactionId,
              user_id: metadata?.userId || null,
              ecommerce: {
                transaction_id: transactionDetails.transactionId,
                value: eventValue,
                currency: currency,
                items: [
                  {
                    item_id: `subscription_${transactionDetails.plan}`,
                    item_name: transactionDetails.name,
                    item_category: "Subscription",
                    price: eventValue,
                    quantity: 1,
                  },
                ],
              },
            };

            console.log(
              "📊 DataLayer Push (First-Time Paid - ONE TIME ONLY):",
              paidEventData,
            );
            window.dataLayer.push(paidEventData);
          } else {
            // 🔴 CASE 3: SUBSEQUENT PAYMENT (renewal, re-subscription after cancel)
            // Do NOT push to dataLayer - user has already been tracked
            console.log(
              "ℹ️ Subsequent payment detected. NOT pushing to dataLayer (user already tracked).",
            );
            console.log("Payment details:", {
              transaction_id: transactionDetails.transactionId,
              value: eventValue,
              currency: currency,
              plan: transactionDetails.plan,
            });
          }
        }

        setProcessed(true);

        // --- Visual Effects (Confetti) ---
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
          });
        }, 250);

        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
          });
        }, 400);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to verify payment");
        setLoading(false);
      }
    };

    verifySession();

    // Mark session as processed only when leaving the page (unmount)
    return () => {
      if (sessionId) {
        markSessionAsProcessed(sessionId);
      }
    };
  }, [sessionId, processed, navigate]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #5C633A 0%, #D4BC8C 100%)",
        }}
      >
        <Card sx={{ p: 4, borderRadius: 3 }}>
          <Stack spacing={3} alignItems="center">
            <CircularProgress size={60} sx={{ color: "#5C633A" }} />
            <Typography variant="h6" color="text.secondary">
              Confirming your subscription...
            </Typography>
          </Stack>
        </Card>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #5C633A 0%, #D4BC8C 100%)",
        }}
      >
        <Container maxWidth="sm">
          <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
            <Box
              sx={{
                p: 3,
                bgcolor: "error.main",
                color: "white",
                textAlign: "center",
              }}
            >
              <Typography variant="h5" fontWeight={600}>
                Oops! Something went wrong
              </Typography>
            </Box>
            <CardContent sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {error}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Don't worry, if you were charged, you'll receive a confirmation
                email.
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="outlined"
                  onClick={() => navigate("/dashboard", { replace: true })}
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate("/subscription", { replace: true })}
                  sx={{ color: "white" }}
                >
                  Try Again
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #5C633A 0%, #D4BC8C 100%)",
        py: 4,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decorations */}
      <Box
        sx={{
          position: "absolute",
          top: -200,
          right: -200,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.1)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -300,
          left: -300,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.05)",
        }}
      />

      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
            }}
          >
            {/* Success Header */}
            <Box
              sx={{
                background: "linear-gradient(135deg, #483C32 0%, #00D4AA 100%)",
                color: "white",
                p: 4,
                textAlign: "center",
                position: "relative",
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5, delay: 0.2 }}
              >
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    mb: 3,
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <CheckCircle sx={{ fontSize: 60 }} />
                </Box>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Typography variant="h3" fontWeight={800} gutterBottom>
                  Welcome to Pro! 🎉
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Your subscription is now active
                </Typography>
              </motion.div>
            </Box>

            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              {/* Success Message */}
              <Alert
                severity="success"
                icon={<Celebration />}
                sx={{
                  mb: 4,
                  borderRadius: 2,
                  "& .MuiAlert-icon": {
                    fontSize: 28,
                  },
                }}
              >
                <Typography variant="body1" fontWeight={600}>
                  Congratulations! You now have unlimited access to all premium
                  features.
                </Typography>
              </Alert>

              {/* What's Included */}
              {/* <Typography variant="h5" fontWeight={700} textAlign="center" gutterBottom>
                                Everything You Get with Pro
                            </Typography>
                            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
                                Start exploring your premium benefits right away
                            </Typography> */}

              {/* <Stack spacing={3} sx={{ mb: 5 }}>
                                {[
                                    {
                                        icon: <School />,
                                        title: 'All Courses Unlocked',
                                        description: 'Access every lesson in Japan in Context and JLPT preparation',
                                        color: '#5C633A',
                                    },
                                    {
                                        icon: <VideoCall />,
                                        title: 'Live Speaking Sessions',
                                        description: 'Join unlimited speaking practice sessions with instructors',
                                        color: '#A6531C',
                                    },
                                    {
                                        icon: <Groups />,
                                        title: 'Exclusive Community',
                                        description: 'Connect with serious learners and native speakers',
                                        color: '#D4BC8C',
                                    },
                                    {
                                        icon: <EmojiEvents />,
                                        title: 'Bonus Points & Rewards',
                                        description: 'Earn double points and unlock special achievements',
                                        color: '#483C32',
                                    },
                                ].map((benefit, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + index * 0.1 }}
                                    >
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                borderRadius: 2,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    borderColor: benefit.color,
                                                    transform: 'translateX(8px)',
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                                },
                                            }}
                                        >
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar
                                                    sx={{
                                                        bgcolor: `${benefit.color}20`,
                                                        color: benefit.color,
                                                        width: 48,
                                                        height: 48,
                                                    }}
                                                >
                                                    {benefit.icon}
                                                </Avatar>
                                                <Box flex={1}>
                                                    <Typography variant="subtitle1" fontWeight={600}>
                                                        {benefit.title}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {benefit.description}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Paper>
                                    </motion.div>
                                ))}
                            </Stack> */}

              {/* Quick Actions */}
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  background:
                    "linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%)",
                  borderRadius: 3,
                  mb: 4,
                  textAlign: "center",
                }}
              >
                <Stack spacing={1} alignItems="center" mb={3}>
                  <AutoAwesome sx={{ fontSize: 32, color: "warning.main" }} />
                  <Typography variant="h6" fontWeight={600}>
                    Ready to start your journey?
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Choose where you'd like to begin
                  </Typography>
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<School />}
                    onClick={() => navigate("/classroom", { replace: true })}
                    fullWidth
                    sx={{
                      py: 1.5,
                      background:
                        "linear-gradient(135deg, #5C633A 0%, #D4BC8C 100%)",
                      color: "white",
                      fontWeight: 600,
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #283618 0%, #D4BC8C 100%)",
                      },
                    }}
                  >
                    Start Learning
                  </Button>

                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<TrendingUp />}
                    onClick={() => navigate("/dashboard", { replace: true })}
                    fullWidth
                    sx={{
                      py: 1.5,
                      fontWeight: 600,
                      borderWidth: 2,
                      "&:hover": {
                        borderWidth: 2,
                      },
                    }}
                  >
                    View Dashboard
                  </Button>
                </Stack>
              </Paper>

              {/* Pro Tips */}
              <Box sx={{ textAlign: "center" }}>
                <Chip
                  icon={<WorkspacePremium />}
                  label="PRO TIP"
                  size="small"
                  color="primary"
                  sx={{ mb: 2, fontWeight: 600 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Start with the placement test to get personalized
                  recommendations based on your current Japanese level.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};
