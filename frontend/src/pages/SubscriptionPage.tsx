// frontend/src/pages/SubscriptionPage.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import {
  ArrowBack,
  Check,
  Close,
  School,
  CalendarMonth,
  Timer,
  Star,
  TrendingUp,
  TrendingDown,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import { AppDispatch, RootState } from "../store/store";
import { useDispatch, useSelector } from "react-redux";
import { paymentService, DiscountStatus } from "../services/paymentService";
import { logout, checkPayment } from "../store/slices/authSlice";
import {
  getStoredPlan,
  clearStoredPlan,
  isValidPlanType,
  PlanType,
} from "../utils/planStorage";
import { useSweetAlert } from "../utils/sweetAlert";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY!);

interface PlanOption {
  id: string;
  name: string;
  regularPrice: number;
  discountedPrice: number;
  currency: string;
  period: string;
  features: {
    title: string;
    included: boolean;
  }[];
  recommended?: boolean;
  savings?: number;
}

const plans: PlanOption[] = [
  // {
  //     id: 'one-time',
  //     name: 'Japan in Context Premiere',
  //     price: 2500,
  //     currency: '$',
  //     period: 'one-time',
  //     stripePriceId: process.env.REACT_APP_STRIPE_ONE_TIME_PRICE_ID || 'price_one-time',
  //     features: [
  //         { title: 'Thrive in Japan Platform', included: true },
  //         { title: 'Speaking Sessions', included: false },
  //         { title: '"Japan in Context" Curriculum', included: true },
  //         { title: '"JLPT in Context" Curriculum', included: false },
  //         { title: 'Access to Exclusive Events and Meet Ups', included: true },
  //         { title: '1-on-1 JCT Certified Personal Coaching', included: true },
  //     ],
  // },
  // {
  //     id: 'monthly',
  //     name: 'Monthly Subscription',
  //     regularPrice: 200,
  //     discountedPrice: 140,
  //     currency: '$',
  //     period: 'month',
  //     recommended: true,
  //     savings: 30,
  //     features: [
  //         { title: 'Thrive in Japan Platform', included: true },
  //         { title: 'Unlimited Speaking Sessions', included: true },
  //         { title: '"Japan in Context" Curriculum', included: true },
  //         { title: '"JLPT in Context" Curriculum', included: true },
  //         { title: 'Access to Exclusive Events and Meet Ups', included: true },
  //     ],
  // },
  // {
  //     id: '`yearly`',
  //     name: 'Yearly Subscription',
  //     regularPrice: 2000,
  //     discountedPrice: 1400,
  //     currency: '$',
  //     period: 'year',
  //     savings: 30,
  //     features: [
  //         { title: 'Thrive in Japan Platform', included: true },
  //         { title: 'Unlimited Speaking Sessions', included: true },
  //         { title: '"Japan in Context" Curriculum', included: true },
  //         { title: '"JLPT in Context" Curriculum', included: true },
  //         { title: 'Access to Exclusive Events and Meet Ups', included: true },
  //     ],
  // },
  {
    id: "standard",
    name: "Standard Plan",
    regularPrice: 12500,
    discountedPrice: 8800,
    currency: "JPY",
    period: "month",
    savings: 30,
    features: [
      { title: "Full Curriculum Access", included: true },
      { title: "4 Standard Speaking Sessions / month", included: true },
      { title: "View All Sessions & Events", included: true }, // Can see everything
      { title: "Sessions do not roll over", included: true }, // Limitation clearly stated
    ],
  },
  {
    id: "premium",
    name: "Premium Plan",
    regularPrice: 35000,
    discountedPrice: 24500,
    currency: "JPY",
    period: "month",
    savings: 30,
    recommended: true,
    features: [
      { title: "Full Curriculum Access", included: true },
      { title: "Unlimited Speaking Sessions", included: true },
      { title: "Join All Premium & Standard Sessions", included: true },
      { title: "Access to Exclusive Events", included: true },
    ],
  },
];

// Plan hierarchy for determining upgrade vs downgrade
const PLAN_HIERARCHY: Record<string, number> = {
  standard: 1,
  premium: 2,
};

type ButtonVariant =
  | "subscribe"
  | "payNow"
  | "upgrade"
  | "downgrade"
  | "current";

interface ButtonState {
  disabled: boolean;
  label: string;
  variant: ButtonVariant;
  icon?: React.ReactNode;
}

const MotionCard = motion(Card);

export const SubscriptionPage: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const [selectedPlan, setSelectedPlan] = useState<string>("standard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { showSuccessToast } = useSweetAlert();
  const [discountStatus, setDiscountStatus] = useState<DiscountStatus | null>(
    null,
  );
  const [loadingDiscount, setLoadingDiscount] = useState(true);
  const [autoCheckoutInProgress, setAutoCheckoutInProgress] = useState(false);
  const [hasPreSelectedPlan, setHasPreSelectedPlan] = useState(false);

  const {
    hasSubscription,
    currentPlan,
    isTrialing,
    status,
    isInFreeTrial,
    freeTrialExpired,
    freeTrialEndDate,
  } = useSelector((state: RootState) => state.auth);

  const autoCheckoutTriggered = useRef(false);

  const getAutoCheckoutPlan = useCallback((): PlanType | null => {
    const params = new URLSearchParams(location.search);
    const urlPlan = params.get("plan");

    if (urlPlan && isValidPlanType(urlPlan)) {
      return urlPlan;
    }

    const storedPlan = getStoredPlan();
    if (storedPlan) {
      return storedPlan;
    }

    return null;
  }, [location.search]);

  useEffect(() => {
    fetchDiscountStatus();

    const storedPlan = getStoredPlan();
    const params = new URLSearchParams(location.search);
    const urlPlan = params.get("plan");

    if (
      (storedPlan && isValidPlanType(storedPlan)) ||
      (urlPlan && isValidPlanType(urlPlan))
    ) {
      setHasPreSelectedPlan(true);
    }
  }, [location.search]);

  useEffect(() => {
    const autoCheckoutPlan = getAutoCheckoutPlan();

    if (
      autoCheckoutPlan &&
      !loadingDiscount &&
      !autoCheckoutTriggered.current &&
      !hasSubscription
    ) {
      autoCheckoutTriggered.current = true;
      setAutoCheckoutInProgress(true);
      clearStoredPlan();
      handleSelectPlan(autoCheckoutPlan);
    }
  }, [loadingDiscount, getAutoCheckoutPlan, hasSubscription]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const fetchDiscountStatus = async () => {
    try {
      const status = await paymentService.checkDiscountStatus();
      setDiscountStatus(status);
    } catch (err) {
      // Error silently handled
    } finally {
      setLoadingDiscount(false);
    }
  };

  /**
   * Determine button state for each plan
   */
  const getButtonState = (planId: string): ButtonState => {
    const isCurrentPlan = currentPlan === planId;

    // User is in free trial (no credit card) OR has expired trial - show Subscribe
    if (isInFreeTrial || freeTrialExpired) {
      return {
        disabled: false,
        label: freeTrialExpired ? "Subscribe Now" : "Upgrade to Paid",
        variant: "subscribe",
      };
    }

    // No subscription - show normal subscribe button
    if (!hasSubscription || !currentPlan) {
      return {
        disabled: false,
        label: "Subscribe Now",
        variant: "subscribe",
      };
    }

    // ===== CASE 2: Subscription is CANCELED =====
    if (status !== "active" && status !== "trialing") {
      return {
        disabled: false,
        label: isCurrentPlan ? "Reactivate Plan" : "Subscribe",
        variant: "subscribe",
      };
    }

    // Current plan + Trialing → "Pay Now"
    if (isCurrentPlan && isTrialing) {
      return {
        disabled: false,
        label: "Pay Now",
        variant: "payNow",
      };
    }

    // Current plan + Active → Disabled
    if (isCurrentPlan && !isTrialing) {
      return {
        disabled: true,
        label: "Current Plan",
        variant: "current",
      };
    }

    // Different plan - check if upgrade or downgrade
    const currentHierarchy = PLAN_HIERARCHY[currentPlan] || 0;
    const targetHierarchy = PLAN_HIERARCHY[planId] || 0;

    if (targetHierarchy > currentHierarchy) {
      // UPGRADE
      return {
        disabled: false,
        label: isTrialing ? "Upgrade Now" : "Upgrade",
        variant: "upgrade",
        icon: <TrendingUp sx={{ fontSize: 18, mr: 1 }} />,
      };
    } else {
      // DOWNGRADE
      return {
        disabled: false,
        label: isTrialing ? "Downgrade Now" : "Downgrade",
        variant: "downgrade",
        icon: <TrendingDown sx={{ fontSize: 18, mr: 1 }} />,
      };
    }
  };

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlan(planId);
    setError("");
    setLoading(true);

    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe failed to load");
      }

      const plan = plans.find((p) => p.id === planId);
      if (!plan) {
        throw new Error("Invalid plan selected");
      }

      const planTypeMap: {
        [key: string]:
          | "monthly"
          | "yearly"
          | "monthlySpecial"
          | "standard"
          | "premium";
      } = {
        standard: "standard",
        premium: "premium",
      };

      // Note: Stripe trials are disabled. Trials are only managed in the application code.
      const response = await paymentService.createCheckoutSession({
        planType: planTypeMap[planId],
        mode: "subscription",
        successUrl: `${window.location.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/subscription`,
        metadata: {
          plan: planId,
        },
        hasTrial: false,
      });

      console.log("Checkout session response:", response);

      // Handle direct upgrade/downgrade or pay now (no checkout needed)
      if (response.isUpgrade || response.isPaidNow || response.isDowngrade) {
        showSuccessToast(
          response.message || "Subscription updated successfully!",
        );
        setLoading(false);

        // Redirect after showing success message
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000);

        // Refresh subscription status
        await dispatch(checkPayment());

        return;
      }

      // Handle checkout redirect
      if (response.sessionId) {
        const result = await stripe.redirectToCheckout({
          sessionId: response.sessionId,
        });

        if (result.error) {
          throw new Error(result.error.message);
        }

        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to process payment");
      setLoading(false);
      setAutoCheckoutInProgress(false);
    }
  };

  const formatPrice = (price: number, currency: string = "JPY") => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "standard":
        return <CalendarMonth sx={{ fontSize: 40, color: "white" }} />;
      case "premium":
        return <School sx={{ fontSize: 40, color: "white" }} />;
      default:
        return <School sx={{ fontSize: 40, color: "white" }} />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case "standard":
        return { primary: "#A6531C", secondary: "#483C32" };
      case "premium":
        return { primary: "#5C633A", secondary: "#283618" };
      default:
        return { primary: "#5C633A", secondary: "#D4BC8C" };
    }
  };

  const isDiscountActive = discountStatus?.isEligible ?? false;

  if (loadingDiscount || autoCheckoutInProgress) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          gap: 2,
        }}
      >
        <CircularProgress />
        {autoCheckoutInProgress && (
          <Typography variant="body1" color="text.secondary">
            Preparing your checkout...
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)",
        py: 4,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: "absolute",
          top: -200,
          right: -200,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "rgba(255, 107, 107, 0.1)",
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
          background: "rgba(78, 205, 196, 0.05)",
        }}
      />

      <Container maxWidth="xl">
        <Button
          startIcon={<ArrowBack />}
          onClick={handleLogout}
          sx={{
            mb: 3,
            "&:hover": {
              bgcolor: "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          {/* Back */}
        </Button>

        {/* Header Section */}
        <Box textAlign="center" sx={{ mb: 4 }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h3" fontWeight={700} gutterBottom>
              {hasSubscription
                ? "Manage Your Subscription"
                : "Choose Your Learning Journey"}
            </Typography>

            {/* Trial Expired Banner */}
            {freeTrialExpired && !hasSubscription && (
              <Alert
                severity="warning"
                sx={{
                  maxWidth: "md",
                  mx: "auto",
                  mt: 2,
                  mb: 2,
                  "& .MuiAlert-message": {
                    width: "100%",
                    textAlign: "center",
                  },
                }}
              >
                <Typography variant="body1" fontWeight={600}>
                  Your free trial has ended
                  {freeTrialEndDate && (
                    <>
                      {" "}
                      on{" "}
                      {new Date(freeTrialEndDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </>
                  )}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  Subscribe now to continue your Japanese learning journey!
                </Typography>
              </Alert>
            )}

            {/* Current Plan Indicator */}
            {(currentPlan || isInFreeTrial || isTrialing) && (
              <Stack
                direction="row"
                spacing={2}
                justifyContent="center"
                sx={{ mt: 2 }}
              >
                {currentPlan && (
                  <Chip
                    icon={<Star />}
                    label={`Current Plan: ${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}`}
                    color="primary"
                    variant="filled"
                  />
                )}
                {(isTrialing || isInFreeTrial) && (
                  <Chip
                    icon={<Timer />}
                    label="Trial Active"
                    color="warning"
                    variant="outlined"
                  />
                )}
                {currentPlan &&
                  status !== "active" &&
                  status !== "trialing" &&
                  !isInFreeTrial && (
                    <Chip
                      icon={<Close />}
                      label="Canceled"
                      color="error"
                      variant="filled"
                    />
                  )}
              </Stack>
            )}
          </motion.div>
        </Box>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert
              severity="error"
              sx={{ mb: 3, maxWidth: "lg", mx: "auto" }}
              onClose={() => setError("")}
            >
              {error}
            </Alert>
          </motion.div>
        )}

        {/* Countdown Timer for Discount */}
        {isDiscountActive && !loadingDiscount && (
          <Box sx={{ textAlign: "center", mb: 10 }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Stack
                direction="row"
                spacing={1}
                justifyContent="center"
                alignItems="center"
              >
                <Timer sx={{ color: "error.main" }} />
                <Typography variant="body1" color="error.main" fontWeight={600}>
                  Limited time offer ends when all {discountStatus?.limit} spots
                  are filled
                </Typography>
              </Stack>
            </motion.div>
          </Box>
        )}

        {/* Plans Grid */}
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={3}
          alignItems="stretch"
          sx={{ maxWidth: "lg", mx: "auto", gap: { xs: "90px 0", lg: "0" } }}
        >
          {plans.map((plan, index) => {
            const colors = getPlanColor(plan.id);
            const buttonState = getButtonState(plan.id);
            const isCurrentPlanCard = currentPlan === plan.id;
            const currentPrice = isDiscountActive
              ? plan.discountedPrice
              : plan.regularPrice;
            const showDiscount =
              isDiscountActive && plan.discountedPrice < plan.regularPrice;

            return (
              <MotionCard
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                sx={{
                  flex: 1,
                  position: "relative",
                  overflow: "visible",
                  borderRadius: "20px",
                  border: isCurrentPlanCard
                    ? "3px solid #2196F3"
                    : plan.recommended
                      ? "2px solid #5C633A"
                      : "none",
                  boxShadow: isCurrentPlanCard ? 10 : plan.recommended ? 8 : 2,
                }}
              >
                {/* Status Badges */}
                {isCurrentPlanCard && (isTrialing || isInFreeTrial) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: { xs: -15, md: 60, lg: 20 },
                        left: -10,
                        bgcolor: "warning.main",
                        color: "white",
                        px: 2,
                        py: 0.5,
                        borderRadius: 2,
                        fontWeight: 700,
                        fontSize: "0.875rem",
                        boxShadow: 3,
                        zIndex: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <Timer sx={{ fontSize: 16 }} />
                      TRIAL
                    </Box>
                  </motion.div>
                )}

                {isCurrentPlanCard &&
                  status !== "active" &&
                  status !== "trialing" &&
                  !isInFreeTrial && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          top: { xs: -15, md: 60, lg: 20 },
                          left: -10,
                          bgcolor: "error.main",
                          color: "white",
                          px: 2,
                          py: 0.5,
                          borderRadius: 2,
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          boxShadow: 3,
                          zIndex: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <Close sx={{ fontSize: 16 }} />
                        CANCELED
                      </Box>
                    </motion.div>
                  )}

                {/* Discount Badge */}
                {showDiscount && (
                  <motion.div
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: -15 }}
                    transition={{ delay: 0.4, type: "spring" }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: { xs: -15, md: 60, lg: 20 },
                        right: -10,
                        bgcolor: "error.main",
                        color: "white",
                        px: 2,
                        py: 0.5,
                        borderRadius: 2,
                        fontWeight: 700,
                        fontSize: "0.875rem",
                        boxShadow: 3,
                        zIndex: 1,
                      }}
                    >
                      SAVE {plan.savings}%
                    </Box>
                  </motion.div>
                )}

                {/* Plan Header */}
                <Box
                  sx={{
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                    color: "white",
                    py: 3,
                    borderRadius: "18px 18px 0 0",
                    textAlign: "center",
                    position: "relative",
                  }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.1, type: "spring" }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        background: "rgba(255, 255, 255, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 2,
                      }}
                    >
                      {getPlanIcon(plan.id)}
                    </Box>
                  </motion.div>
                  <Typography variant="h5" fontWeight={600}>
                    {plan.name}
                  </Typography>
                </Box>

                <CardContent sx={{ p: 4 }}>
                  {/* Price Section */}
                  <Box textAlign="center" sx={{ mb: 4 }}>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      {showDiscount && (
                        <Typography
                          variant="h5"
                          sx={{
                            textDecoration: "line-through",
                            color: "text.secondary",
                            mb: 1,
                          }}
                        >
                          {formatPrice(plan.regularPrice, plan.currency)}
                        </Typography>
                      )}
                      <Typography
                        variant="h3"
                        fontWeight={700}
                        sx={{
                          color: showDiscount ? "error.main" : colors.primary,
                        }}
                      >
                        {formatPrice(currentPrice, plan.currency)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        per {plan.period}
                      </Typography>
                    </motion.div>
                  </Box>

                  {/* Features List */}
                  <Stack spacing={2} sx={{ mb: 4 }}>
                    {plan.features.map((feature, featureIndex) => (
                      <motion.div
                        key={featureIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.3 + index * 0.1 + featureIndex * 0.05,
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          {feature.included ? (
                            <Check
                              sx={{ color: "success.main", fontSize: 20 }}
                            />
                          ) : (
                            <Close sx={{ color: "error.main", fontSize: 20 }} />
                          )}
                          <Typography
                            variant="body2"
                            sx={{
                              textDecoration: feature.included
                                ? "none"
                                : "line-through",
                              color: feature.included
                                ? "text.primary"
                                : "text.secondary",
                              fontWeight: feature.title.includes("FREE")
                                ? 600
                                : 400,
                            }}
                          >
                            {feature.title}
                          </Typography>
                        </Stack>
                      </motion.div>
                    ))}
                  </Stack>

                  {/* CTA Button */}
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={
                      buttonState.disabled ||
                      (loading && selectedPlan === plan.id)
                    }
                    sx={{
                      py: 1.5,
                      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                      color: buttonState.disabled ? "text.disabled" : "white",
                      fontWeight: 600,
                      position: "relative",
                      overflow: "hidden",
                      "&:hover": {
                        background: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.primary} 100%)`,
                      },
                      "&:disabled": {
                        background: "rgba(0, 0, 0, 0.12)",
                        color: "rgba(0, 0, 0, 0.38)",
                      },
                    }}
                  >
                    <AnimatePresence mode="wait">
                      {loading && selectedPlan === plan.id ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <CircularProgress size={24} color="inherit" />
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="center"
                          >
                            {buttonState.icon}
                            {buttonState.label}
                          </Stack>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </CardContent>
              </MotionCard>
            );
          })}
        </Stack>
      </Container>
    </Box>
  );
};
