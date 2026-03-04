// frontend/src/pages/admin/AdminVideoPage.tsx
import React from 'react';
import { Container } from '@mui/material';
import { VideoManagement } from '../../components/admin/VideoManagement';
import AdminNavigationButton from '../../components/admin/AdminNavigationButton';

export const AdminVideoPage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      {/* Main Content */}
      <VideoManagement />
    </Container>
  );
};