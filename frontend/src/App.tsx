import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, RootState, AppDispatch } from './store/store';
import { theme } from './theme/theme';
import { chackPayment, checkAuth } from './store/slices/authSlice';
import { CircularProgress, Box } from '@mui/material';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClassroomPage } from './pages/ClassroomPage';
import { CommunityPage } from './pages/CommunityPage';
import { ProfilePage } from './pages/ProfilePage';
import { PublicProfilePage } from './pages/PublicProfilePage'; // Add this import
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage'

// Registration Pages
// import { EmailVerificationPage } from './pages/registration/EmailVerificationPage';
// import { PaymentPlanPage } from './pages/registration/PaymentPlanPage';
// import { CreateAccountPage } from './pages/registration/CreateAccountPage';
// import { RegistrationCompletePage } from './pages/registration/RegistrationCompletePage';
import { NewRegistrationPage } from './pages/NewRegistrationPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { CourseManagement } from './pages/admin/CourseManagement';
import { CommunityModeration } from './pages/admin/CommunityModeration';
import { SessionManagement } from './pages/admin/SessionManagement';
import { Analytics } from './pages/admin/Analytics';

// Components
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Layout } from './components/layout/Layout';

import { CalendarPage } from './pages/CalendarPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { RegistrationSuccessPage } from './pages/RegistrationSuccessPage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { SubscriptionSuccessPage } from './pages/SubscriptionSuccessPage';
import { fetchDashboardData } from './store/slices/dashboardSlice';

function AppContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { authChecking, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Check auth status on app load
    dispatch(checkAuth());
    dispatch(chackPayment());
    dispatch(fetchDashboardData());
  }, [dispatch]);

  if (authChecking) {
    // Show loading spinner while checking auth
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* Public Routes (no authentication required) */}
        <Route path="/profile/:userId" element={<PublicProfilePage />} /> {/* Add this route */}

        {/* <Route path="/register/email" element={<EmailVerificationPage />} />
        <Route path="/register/payment" element={<PaymentPlanPage />} />
        <Route path="/register/account" element={<CreateAccountPage />} />
        <Route path="/register/complete" element={<RegistrationCompletePage />} /> */}

        <Route path="/register" element={<NewRegistrationPage />} />
        <Route path="/register/verify" element={<VerifyEmailPage />} />
        <Route path="/register/success" element={<RegistrationSuccessPage />} />

        <Route
          path="/subscription"
          element={
            <SubscriptionPage />
          }
        />

        <Route
          path="/subscription/success"
          element={
            <SubscriptionSuccessPage />
          }
        />

        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />

        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* User Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/classroom"
          element={
            <ProtectedRoute>
              <Layout>
                <ClassroomPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <Layout>
                <CommunityPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <ProfilePage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <Layout>
                <UserManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <Layout>
                <CourseManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/community"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <Layout>
                <CommunityModeration />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sessions"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <Layout>
                <SessionManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <Layout>
                <Analytics />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Layout>
                <CalendarPage />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}


function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
}

export default App;