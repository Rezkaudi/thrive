// frontend/src/pages/admin/AdminVideoPage.tsx
import React from 'react';
import { Container, Typography, Box, Breadcrumbs, Link } from '@mui/material';
import { Home, AdminPanelSettings } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { VideoManagement } from '../../components/admin/VideoManagement';

export const AdminVideoPage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      {/* Main Content */}
      <VideoManagement />
    </Container>
  );
};