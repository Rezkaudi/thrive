// frontend/src/pages/ManageSubscriptionPage.tsx
import React from "react";
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  Stack,
  Button,
  alpha,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { NavigateNext, AdminPanelSettings, ArrowBack } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { SubscriptionManagement } from "../components/profile/SubscriptionManagement";

export const ManageSubscriptionPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  // Admin-specific state — show a clear message instead of silent redirect
  if (user?.role === "ADMIN") {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 3 }}>
        <Container maxWidth="sm">
          <Stack
            alignItems="center"
            spacing={2.5}
            sx={{
              mt: { xs: 8, md: 14 },
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                color: "primary.main",
              }}
            >
              <AdminPanelSettings sx={{ fontSize: 36 }} />
            </Box>
            <Typography variant="h5" fontWeight={700}>
              No Subscription Needed
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 360 }}
            >
              Admin accounts have full platform access by default.
              Subscriptions are only for student accounts.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
              onClick={() => navigate("/dashboard")}
              sx={{
                mt: 1,
                borderRadius: 2,
                textTransform: "none",
                borderColor: "divider",
                color: "text.secondary",
                "&:hover": {
                  borderColor: "primary.main",
                  color: "primary.main",
                  transform: "none",
                },
              }}
            >
              Back to Dashboard
            </Button>
          </Stack>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 3 }}>
      <Container maxWidth="lg">
        {/* Breadcrumb */}
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          sx={{ mb: 3 }}
        >
          <MuiLink
            component={Link}
            to="/profile"
            underline="hover"
            color="text.secondary"
            sx={{ fontSize: "0.875rem" }}
          >
            Profile
          </MuiLink>
          <Typography color="text.primary" sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
            Subscription
          </Typography>
        </Breadcrumbs>

        <SubscriptionManagement />
      </Container>
    </Box>
  );
};
