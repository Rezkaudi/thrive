// frontend/src/components/profile/SubscriptionManagement.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Check,
  Close,
  Star,
  Timer,
  TrendingUp,
  TrendingDown,
  CreditCard,
  CalendarMonth,
  School,
  ArrowForward,
  Shield,
  Bolt,
  AutoAwesome,
  Warning,
  InfoOutlined,
  OpenInNew,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { paymentService, DiscountStatus } from "../../services/paymentService";
import { subscriptionService } from "../../services/subscriptionService";
import { checkPayment } from "../../store/slices/authSlice";
import { useSweetAlert } from "../../utils/sweetAlert";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY!);

// ─── Plan data ────────────────────────────────────────────────
interface PlanInfo {
  id: string;
  name: string;
  regularPrice: number;
  discountedPrice: number;
  currency: string;
  period: string;
  icon: React.ReactNode;
  color: { primary: string; secondary: string; bg: string };
  features: string[];
  recommended?: boolean;
  savings?: number;
}

const PLANS: PlanInfo[] = [
  {
    id: "standard",
    name: "Standard",
    regularPrice: 12500,
    discountedPrice: 8800,
    currency: "JPY",
    period: "month",
    savings: 30,
    icon: <CalendarMonth sx={{ fontSize: 28 }} />,
    color: {
      primary: "#A6531C",
      secondary: "#483C32",
      bg: "rgba(166, 83, 28, 0.06)",
    },
    features: [
      "Full Curriculum Access",
      "4 Standard Speaking Sessions / month",
      "View All Sessions & Events",
      "Sessions do not roll over",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    regularPrice: 35000,
    discountedPrice: 24500,
    currency: "JPY",
    period: "month",
    savings: 30,
    recommended: true,
    icon: <School sx={{ fontSize: 28 }} />,
    color: {
      primary: "#5C633A",
      secondary: "#283618",
      bg: "rgba(92, 99, 58, 0.06)",
    },
    features: [
      "Full Curriculum Access",
      "Unlimited Speaking Sessions",
      "Join All Premium & Standard Sessions",
      "Access to Exclusive Events",
    ],
  },
];

const PLAN_HIERARCHY: Record<string, number> = {
  standard: 1,
  premium: 2,
};

// ─── Helpers ──────────────────────────────────────────────────
const formatPrice = (price: number, currency: string = "JPY") =>
  new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

const formatDate = (d: string | Date | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// ─── Motion wrapper ───────────────────────────────────────────
const MotionBox = motion(Box);
const MotionCard = motion(Card);

// ─── Component ────────────────────────────────────────────────
export const SubscriptionManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { showSuccessToast } = useSweetAlert();

  const {
    hasSubscription,
    currentPlan,
    isTrialing,
    status,
    isInFreeTrial,
    freeTrialExpired,
    freeTrialEndDate,
  } = useSelector((state: RootState) => state.auth);
  const { user } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [discountStatus, setDiscountStatus] = useState<DiscountStatus | null>(
    null,
  );
  const [, setLoadingDiscount] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Fetch discount status
  useEffect(() => {
    (async () => {
      try {
        const ds = await paymentService.checkDiscountStatus();
        setDiscountStatus(ds);
      } catch {
        /* silent */
      } finally {
        setLoadingDiscount(false);
      }
    })();
  }, []);

  // ── Determine action type for a plan ──────────────────────
  type ActionType =
    | "current"
    | "upgrade"
    | "downgrade"
    | "subscribe"
    | "reactivate"
    | "payNow";

  const getAction = (planId: string): ActionType => {
    if (isInFreeTrial || freeTrialExpired) return "subscribe";
    if (!hasSubscription || !currentPlan) return "subscribe";
    if (status !== "active" && status !== "trialing") {
      return currentPlan === planId ? "reactivate" : "subscribe";
    }
    if (currentPlan === planId && isTrialing) return "payNow";
    if (currentPlan === planId) return "current";
    const curr = PLAN_HIERARCHY[currentPlan] || 0;
    const tgt = PLAN_HIERARCHY[planId] || 0;
    return tgt > curr ? "upgrade" : "downgrade";
  };

  const actionMeta: Record<
    ActionType,
    { label: string; color: string; icon: React.ReactNode }
  > = {
    current: {
      label: "Current Plan",
      color: "#9e9e9e",
      icon: <Check sx={{ fontSize: 18 }} />,
    },
    upgrade: {
      label: "Upgrade",
      color: "#5C633A",
      icon: <TrendingUp sx={{ fontSize: 18 }} />,
    },
    downgrade: {
      label: "Downgrade",
      color: "#A6531C",
      icon: <TrendingDown sx={{ fontSize: 18 }} />,
    },
    subscribe: {
      label: "Subscribe",
      color: "#5C633A",
      icon: <ArrowForward sx={{ fontSize: 18 }} />,
    },
    reactivate: {
      label: "Reactivate",
      color: "#5C633A",
      icon: <Bolt sx={{ fontSize: 18 }} />,
    },
    payNow: {
      label: "Pay Now",
      color: "#A6531C",
      icon: <CreditCard sx={{ fontSize: 18 }} />,
    },
  };

  // ── Handle plan selection (upgrade/downgrade/subscribe) ───
  const handleSelectPlan = async (planId: string) => {
    setLoading(planId);
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to load");

      const planTypeMap: Record<
        string,
        "monthly" | "yearly" | "monthlySpecial" | "standard" | "premium"
      > = { standard: "standard", premium: "premium" };

      const response = await paymentService.createCheckoutSession({
        planType: planTypeMap[planId],
        mode: "subscription",
        successUrl: `${window.location.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/profile`,
        metadata: { plan: planId },
        hasTrial: false,
      });

      // Direct upgrade/downgrade/payNow — no redirect needed
      if (response.isUpgrade || response.isPaidNow || response.isDowngrade) {
        showSuccessToast(
          response.message || "Subscription updated successfully!",
        );
        await dispatch(checkPayment());
        setLoading(null);
        return;
      }

      // Stripe checkout redirect
      if (response.sessionId) {
        const result = await stripe.redirectToCheckout({
          sessionId: response.sessionId,
        });
        if (result.error) throw new Error(result.error.message);
      }
    } catch (err: any) {
      console.error("Subscription error:", err);
    } finally {
      setLoading(null);
    }
  };

  // ── Open Stripe Customer Portal (billing / cancel) ────────
  const handleManageViaPortal = async () => {
    setPortalLoading(true);
    try {
      const data = await subscriptionService.createCustomerPortal();
      window.location.href = data.session.url;
    } catch {
      /* silent */
    } finally {
      setPortalLoading(false);
    }
  };

  // ── Cancel confirmation dialog ────────────────────────────
  const handleCancelClick = () => setCancelDialogOpen(true);

  const handleConfirmCancel = async () => {
    setCancelDialogOpen(false);
    handleManageViaPortal();
  };

  // ── Derived state ─────────────────────────────────────────
  const currentPlanInfo = PLANS.find((p) => p.id === currentPlan);
  const isActive = status === "active" || status === "trialing";
  const isCanceled =
    hasSubscription && status !== "active" && status !== "trialing";
  const isDiscountActive = discountStatus?.isEligible ?? false;

  // Don't show for admins
  if (user?.role === "ADMIN") return null;

  // ─── RENDER ───────────────────────────────────────────────
  return (
    <Box>
      {/* ── Status banner ─────────────────────────────────── */}
      <AnimatePresence>
        {(freeTrialExpired || isCanceled) && (
          <MotionBox
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Alert
              severity="warning"
              icon={<Warning />}
              sx={{ mb: 3, borderRadius: 3 }}
            >
              <Typography variant="body2" fontWeight={600}>
                {freeTrialExpired
                  ? `Your free trial ended${freeTrialEndDate ? ` on ${formatDate(freeTrialEndDate)}` : ""}. Subscribe to continue learning!`
                  : "Your subscription has been canceled. Reactivate or choose a new plan below."}
              </Typography>
            </Alert>
          </MotionBox>
        )}
      </AnimatePresence>

      {/* ── Current plan summary card ─────────────────────── */}
      {(hasSubscription || isInFreeTrial) && (
        <MotionCard
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          sx={{
            mb: 4,
            borderRadius: 4,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
            "&:hover": {
              transform: "none",
              boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
            },
          }}
        >
          {/* Accent top bar */}
          <Box
            sx={{
              height: 4,
              background: currentPlanInfo
                ? `linear-gradient(90deg, ${currentPlanInfo.color.primary} 0%, ${currentPlanInfo.color.secondary} 100%)`
                : "linear-gradient(90deg, #5C633A 0%, #D4BC8C 100%)",
            }}
          />

          <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              spacing={2}
            >
              {/* Left: Plan info */}
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: currentPlanInfo
                      ? `linear-gradient(135deg, ${currentPlanInfo.color.primary}, ${currentPlanInfo.color.secondary})`
                      : "linear-gradient(135deg, #5C633A, #D4BC8C)",
                    color: "white",
                    flexShrink: 0,
                  }}
                >
                  {currentPlanInfo?.icon || <Star sx={{ fontSize: 28 }} />}
                </Box>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h6" fontWeight={700}>
                      {currentPlanInfo?.name ||
                        (isInFreeTrial ? "Free Trial" : "No Plan")}
                    </Typography>
                    {isActive && !isInFreeTrial && (
                      <Chip
                        size="small"
                        label={isTrialing ? "Trial" : "Active"}
                        sx={{
                          bgcolor: isTrialing
                            ? alpha("#ED6C02", 0.1)
                            : alpha("#5C633A", 0.1),
                          color: isTrialing ? "#ED6C02" : "#5C633A",
                          fontWeight: 600,
                          fontSize: "0.7rem",
                          height: 22,
                        }}
                      />
                    )}
                    {isCanceled && (
                      <Chip
                        size="small"
                        label="Canceled"
                        sx={{
                          bgcolor: alpha("#d32f2f", 0.1),
                          color: "#d32f2f",
                          fontWeight: 600,
                          fontSize: "0.7rem",
                          height: 22,
                        }}
                      />
                    )}
                    {isInFreeTrial && (
                      <Chip
                        size="small"
                        icon={<Timer sx={{ fontSize: 14 }} />}
                        label="Free Trial"
                        sx={{
                          bgcolor: alpha("#ED6C02", 0.1),
                          color: "#ED6C02",
                          fontWeight: 600,
                          fontSize: "0.7rem",
                          height: 22,
                        }}
                      />
                    )}
                  </Stack>
                  <Typography variant="body2" color="text.secondary" mt={0.25}>
                    {isInFreeTrial
                      ? "Explore our platform for free"
                      : ""}
                  </Typography>
                </Box>
              </Stack>

              {/* Right: Quick actions */}
              <Stack direction="row" spacing={1.5} flexWrap="wrap">
                {hasSubscription && isActive && !isInFreeTrial && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={
                      portalLoading ? (
                        <CircularProgress size={14} />
                      ) : (
                        <CreditCard sx={{ fontSize: 16 }} />
                      )
                    }
                    onClick={handleManageViaPortal}
                    disabled={portalLoading}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      borderColor: "divider",
                      color: "text.secondary",
                      fontWeight: 500,
                      fontSize: "0.8rem",
                      "&:hover": {
                        borderColor: "primary.main",
                        color: "primary.main",
                        transform: "none",
                      },
                    }}
                  >
                    Billing
                  </Button>
                )}
                {hasSubscription &&
                  isActive &&
                  !isInFreeTrial &&
                  !isTrialing && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Close sx={{ fontSize: 16 }} />}
                      onClick={handleCancelClick}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        borderColor: alpha("#d32f2f", 0.3),
                        color: "#d32f2f",
                        fontWeight: 500,
                        fontSize: "0.8rem",
                        "&:hover": {
                          borderColor: "#d32f2f",
                          bgcolor: alpha("#d32f2f", 0.04),
                          transform: "none",
                        },
                      }}
                    >
                      Cancel
                    </Button>
                  )}
              </Stack>
            </Stack>
          </CardContent>
        </MotionCard>
      )}

      {/* ── Plan comparison cards ─────────────────────────── */}
      <Box mb={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6" fontWeight={700}>
            {hasSubscription ? "Switch Plan" : "Choose a Plan"}
          </Typography>
          {/* {isDiscountActive && (
            <Chip
              size="small"
              icon={<AutoAwesome sx={{ fontSize: 14 }} />}
              label={`${discountStatus?.remainingSpots} discount spots left`}
              sx={{
                bgcolor: alpha("#d32f2f", 0.08),
                color: "#d32f2f",
                fontWeight: 600,
              }}
            />
          )} */}
        </Stack>
      </Box>

      <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
        {PLANS.map((plan, idx) => {
          const action = getAction(plan.id);
          const meta = actionMeta[action];
          const isCurrent = currentPlan === plan.id;
          const isCurrentActive = isCurrent && isActive;
          const showDiscount =
            isDiscountActive && plan.discountedPrice < plan.regularPrice;
          const price = showDiscount ? plan.discountedPrice : plan.regularPrice;

          return (
            <MotionCard
              key={plan.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              sx={{
                flex: 1,
                position: "relative",
                borderRadius: 4,
                border: "2px solid",
                borderColor: isCurrentActive
                  ? plan.color.primary
                  : plan.recommended && !isCurrentActive
                    ? alpha(plan.color.primary, 0.3)
                    : "divider",
                overflow: "visible",
                boxShadow: isCurrentActive
                  ? `0 4px 24px ${alpha(plan.color.primary, 0.15)}`
                  : "0 2px 12px rgba(0,0,0,0.04)",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: `0 8px 32px ${alpha(plan.color.primary, 0.12)}`,
                },
                transition: "all 0.3s ease",
              }}
            >
              {/* Recommended badge */}
              {plan.recommended && !isCurrentActive && (
                <Chip
                  size="small"
                  icon={
                    <Star sx={{ fontSize: 14, color: "white !important" }} />
                  }
                  label="Recommended"
                  sx={{
                    position: "absolute",
                    top: -12,
                    right: 16,
                    bgcolor: plan.color.primary,
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    height: 24,
                    zIndex: 1,
                  }}
                />
              )}

              {/* Current plan badge */}
              {isCurrentActive && (
                <Chip
                  size="small"
                  icon={
                    <Check sx={{ fontSize: 14, color: "white !important" }} />
                  }
                  label="Your Plan"
                  sx={{
                    position: "absolute",
                    top: -12,
                    right: 16,
                    bgcolor: plan.color.primary,
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    height: 24,
                    zIndex: 1,
                  }}
                />
              )}

              <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                {/* Plan header */}
                <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: plan.color.bg,
                      color: plan.color.primary,
                    }}
                  >
                    {plan.icon}
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {plan.name}
                    </Typography>
                  </Box>
                </Stack>

                {/* Price */}
                <Box mb={2.5}>
                  {showDiscount && (
                    <Typography
                      variant="body2"
                      sx={{
                        textDecoration: "line-through",
                        color: "text.disabled",
                        mb: 0.25,
                      }}
                    >
                      {formatPrice(plan.regularPrice, plan.currency)}
                    </Typography>
                  )}
                  <Stack direction="row" alignItems="baseline" spacing={0.75}>
                    <Typography
                      variant="h4"
                      fontWeight={800}
                      sx={{
                        color: showDiscount ? "#d32f2f" : plan.color.primary,
                      }}
                    >
                      {formatPrice(price, plan.currency)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      / {plan.period}
                    </Typography>
                  </Stack>
                  {showDiscount && (
                    <Chip
                      size="small"
                      label={`Save ${plan.savings}%`}
                      sx={{
                        mt: 0.5,
                        bgcolor: alpha("#d32f2f", 0.08),
                        color: "#d32f2f",
                        fontWeight: 600,
                        fontSize: "0.7rem",
                        height: 20,
                      }}
                    />
                  )}
                </Box>

                <Divider sx={{ mb: 2.5 }} />

                {/* Features */}
                <Stack spacing={1.25} mb={3}>
                  {plan.features.map((feat, i) => (
                    <Stack
                      key={i}
                      direction="row"
                      spacing={1}
                      alignItems="flex-start"
                    >
                      <Check
                        sx={{
                          fontSize: 18,
                          color: plan.color.primary,
                          mt: 0.25,
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {feat}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>

                {/* Action button */}
                <Button
                  fullWidth
                  variant={action === "current" ? "outlined" : "contained"}
                  disabled={action === "current" || loading === plan.id}
                  onClick={() => handleSelectPlan(plan.id)}
                  startIcon={
                    loading === plan.id ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      meta.icon
                    )
                  }
                  sx={{
                    py: 1.25,
                    borderRadius: 2.5,
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    ...(action !== "current" && {
                      background: `linear-gradient(135deg, ${plan.color.primary} 0%, ${plan.color.secondary} 100%)`,
                      color: "white",
                      "&:hover": {
                        background: `linear-gradient(135deg, ${plan.color.secondary} 0%, ${plan.color.primary} 100%)`,
                        transform: "none",
                      },
                    }),
                    ...(action === "current" && {
                      borderColor: "divider",
                      color: "text.disabled",
                      "&:hover": { transform: "none" },
                    }),
                    ...(action === "downgrade" && {
                      background: `linear-gradient(135deg, ${plan.color.primary} 0%, ${plan.color.secondary} 100%)`,
                    }),
                  }}
                >
                  {loading === plan.id ? "Processing..." : meta.label}
                </Button>
              </CardContent>
            </MotionCard>
          );
        })}
      </Stack>

      {/* ── Trust badges ──────────────────────────────────── */}
      <Stack
        direction="row"
        spacing={3}
        justifyContent="center"
        mt={4}
        flexWrap="wrap"
        useFlexGap
      >
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Shield sx={{ fontSize: 16, color: "text.disabled" }} />
          <Typography variant="caption" color="text.secondary">
            Secure payments via Stripe
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Bolt sx={{ fontSize: 16, color: "text.disabled" }} />
          <Typography variant="caption" color="text.secondary">
            Instant plan changes
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <InfoOutlined sx={{ fontSize: 16, color: "text.disabled" }} />
          <Typography variant="caption" color="text.secondary">
            Cancel anytime
          </Typography>
        </Stack>
      </Stack>

      {/* ── Cancel Confirmation Dialog ────────────────────── */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Warning sx={{ color: "#ED6C02" }} />
            <Typography variant="h6" fontWeight={700}>
              Cancel Subscription?
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            You will be redirected to the Stripe billing portal to manage your
            cancellation. Your access will continue until the end of your
            current billing period.
          </Typography>
          <Box
            sx={{
              bgcolor: alpha("#ED6C02", 0.06),
              borderRadius: 2,
              p: 2,
            }}
          >
            <Typography variant="body2" fontWeight={600} color="#ED6C02">
              What you'll lose:
            </Typography>
            <Stack spacing={0.5} mt={1}>
              {currentPlanInfo?.features.map((f, i) => (
                <Stack key={i} direction="row" spacing={1} alignItems="center">
                  <Close sx={{ fontSize: 14, color: "#d32f2f" }} />
                  <Typography variant="caption" color="text.secondary">
                    {f}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setCancelDialogOpen(false)}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              color: "text.secondary",
            }}
          >
            Keep My Plan
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmCancel}
            startIcon={<OpenInNew sx={{ fontSize: 16 }} />}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              bgcolor: "#d32f2f",
              "&:hover": { bgcolor: "#b71c1c", transform: "none" },
            }}
          >
            Continue to Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
