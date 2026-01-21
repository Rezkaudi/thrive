import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { CircularProgress, Box } from '@mui/material';

import { theme } from './theme/theme';

import { store, RootState, AppDispatch } from './store/store';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { checkPayment, checkAuth } from './store/slices/authSlice';
import { fetchDashboardData } from './store/slices/dashboardSlice';

// Auth Pages
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';

// Admin Pages
import { Analytics } from './pages/admin/Analytics';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { CourseManagement } from './pages/admin/CourseManagement';
import { SessionManagement } from './pages/admin/SessionManagement';
import { CommunityModeration } from './pages/admin/CommunityModeration';

// Pages
import { ProfilePage } from './pages/ProfilePage';
import { DashboardPage } from './pages/DashboardPage';
import { ClassroomPage } from './pages/ClassroomPage';
import { CommunityPage } from './pages/CommunityPage';
import { CalendarPage } from './pages/CalendarPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { SubscriptionPage } from './pages/SubscriptionPage';

// Components
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { AdminCourseDetailPage } from './pages/admin/AdminCourseDetailPage';
import { AdminVideoPage } from './pages/admin/AdminVideoPage';
import { SpecialSubscriptionPage } from './pages/studentOfShiego/SpecialSubscriptionPage';
import { SpecialVerifyEmailPage } from './pages/studentOfShiego/SpecialVerifyEmailPage';
import { SpecialNewRegistrationPage } from './pages/studentOfShiego/SpecialNewRegistrationPage';
import { SubscriptionSuccessPage } from './pages/SubscriptionSuccessPage';


function AppContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { authChecking, isAuthenticated, paymentChecking } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      await dispatch(checkPayment());
      await dispatch(fetchDashboardData());
      await dispatch(checkAuth());
      setLoading(false);
    };

    initApp();
  }, [dispatch]);

  if (authChecking || loading || paymentChecking) {
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

        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/register/verify" element={<VerifyEmailPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/profile/:userId" element={<PublicProfilePage />} />

        <Route
          path="/subscription"
          element={
            isAuthenticated ? (
              <SubscriptionPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/subscription/success"
          element={
            isAuthenticated ? (
              <SubscriptionSuccessPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Student of Shiego */}
        <Route path="/student-of-shiego/register" element={<SpecialNewRegistrationPage />} />
        <Route path="/student-of-shiego/register/verify" element={<SpecialVerifyEmailPage />} />
        <Route
          path="/student-of-shiego/subscription"
          element={isAuthenticated ? <SpecialSubscriptionPage /> : <Navigate to="/login" replace />}
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
          path="/classroom/:courseId"
          element={
            <ProtectedRoute>
              <Layout>
                <CourseDetailPage />
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
          path='/admin/videos'
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <Layout>
                <AdminVideoPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/courses/:courseId"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <Layout>
                <AdminCourseDetailPage />
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


        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="*" element={<NotFoundPage />} />
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