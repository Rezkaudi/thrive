// File: frontend/src/pages/admin/SessionManagement.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Tabs,
  Tab,
  Avatar,
  Tooltip,
  Badge,
  Snackbar,
  Pagination,
  FormGroup,
  Checkbox,
  Divider,
  TablePagination,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  People,
  VideoCall,
  LocationOn,
  CalendarMonth,
  AccessTime,
  Star,
  Event,
  Mic,
  Schedule,
  PersonAdd,
  Visibility,
  Close,
  Repeat,
  Loop,
  Timeline,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import api from '../../services/api';
import { useSweetAlert } from '../../utils/sweetAlert';

interface Session {
  id: string;
  title: string;
  description: string;
  type: 'SPEAKING' | 'EVENT';
  hostId: string;
  hostName?: string;
  meetingUrl?: string;
  location?: string;
  scheduledAt: string;
  duration: number;
  maxParticipants: number;
  currentParticipants: number;
  pointsRequired: number;
  isActive: boolean;
  isRecurring: boolean;
  recurringParentId?: string;
  recurringWeeks?: number;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const SessionManagement: React.FC = () => {
  const { showConfirm, showError } = useSweetAlert();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionDialog, setSessionDialog] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  
  // Filters
  const [filters, setFilters] = useState({
    type: '',
    isActive: '',
    isRecurring: '',
  });
  
  // Add Snackbar state
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' | 'warning' | 'info' 
  });
  
  type SessionType = 'SPEAKING' | 'EVENT';
  
  const [sessionForm, setSessionForm] = useState<{
    title: string;
    description: string;
    type: SessionType;
    meetingUrl: string;
    location: string;
    scheduledAt: Date;
    duration: number;
    maxParticipants: number;
    pointsRequired: number;
    isActive: boolean;
    isRecurring: boolean;
    recurringWeeks: number;
    updateAllRecurring: boolean;
    }>({
    title: '',
    description: '',
    type: 'SPEAKING',
    meetingUrl: '',
    location: '',
    scheduledAt: new Date(),
    duration: 30,
    maxParticipants: 8,
    pointsRequired: 0,
    isActive: true,
    isRecurring: false,
    recurringWeeks: 4,
    updateAllRecurring: false,
  });

  useEffect(() => {
    fetchSessions();
  }, [pagination.page, pagination.limit, filters]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = { 
        page: pagination.page,
        limit: pagination.limit,
      };

      // Add filters if they are set
      if (filters.type) params.type = filters.type;
      if (filters.isActive !== '') params.isActive = filters.isActive;
      if (filters.isRecurring !== '') params.isRecurring = filters.isRecurring;
      
      const response = await api.get('/admin/sessions/paginated', { params });
      
      const { sessions: sessionsData, pagination: paginationData } = response.data;
      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
      setPagination(paginationData);
    } catch (error: any) {
      console.error('Failed to fetch sessions:', error);
      setError(error.response?.data?.error || 'Failed to load sessions');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSession = async () => {
    try {
      const payload = {
        ...sessionForm,
        scheduledAt: sessionForm.scheduledAt.toISOString(),
      };

      if (editingSession) {
        if (editingSession.isRecurring && sessionForm.updateAllRecurring) {
          payload.updateAllRecurring = true;
        }
        
        await api.put(`/admin/sessions/${editingSession.id}`, payload);
        setSnackbar({ 
          open: true, 
          message: editingSession.isRecurring && sessionForm.updateAllRecurring 
            ? 'All recurring sessions updated successfully!' 
            : 'Session updated successfully!', 
          severity: 'success' 
        });
      } else {
        const response = await api.post('/admin/sessions', payload);
        
        if (response.data.sessions && response.data.sessions.length > 1) {
          setSnackbar({ 
            open: true, 
            message: `Created ${response.data.sessions.length} recurring sessions successfully!`, 
            severity: 'success' 
          });
        } else {
          setSnackbar({ 
            open: true, 
            message: 'Session created successfully!', 
            severity: 'success' 
          });
        }
      }

      setSessionDialog(false);
      setEditingSession(null);
      resetForm();
      fetchSessions();
    } catch (error: any) {
      console.error('Failed to save session:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.error || 'Failed to save session', 
        severity: 'error' 
      });
    }
  };

  const handleDeleteSession = async (sessionId: string, session: Session) => {
    let confirmOptions = {
      title: 'Delete Session',
      text: 'Are you sure you want to delete this session? This action cannot be undone.',
      icon: 'warning' as const,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
    };

    // If it's a recurring session parent, ask about deleting all
    if (session.isRecurring && !session.recurringParentId) {
      confirmOptions = {
        title: 'Delete Recurring Session Series',
        text: `This is a recurring session with ${session.recurringWeeks || 'multiple'} sessions. Do you want to delete the entire series or just this session?`,
        icon: 'warning' as const,
        confirmButtonText: 'Delete Series',
        cancelButtonText: 'Cancel',
      };
    }

    const result = await showConfirm(confirmOptions);

    if (result.isConfirmed) {
      try {
        const deleteParams: any = {};
        
        // If it's a recurring parent and user confirmed, delete all
        if (session.isRecurring && !session.recurringParentId) {
          deleteParams.deleteAllRecurring = 'true';
        }

        await api.delete(`/admin/sessions/${sessionId}`, { params: deleteParams });
        
        setSnackbar({ 
          open: true, 
          message: session.isRecurring && !session.recurringParentId 
            ? 'Recurring session series deleted successfully!' 
            : 'Session deleted successfully!', 
          severity: 'success' 
        });
        fetchSessions();
      } catch (error: any) {
        console.error('Failed to delete session:', error);
        setSnackbar({ 
          open: true, 
          message: error.response?.data?.error || 'Failed to delete session', 
          severity: 'error' 
        });
      }
    }
  };

  const resetForm = () => {
    setSessionForm({
      title: '',
      description: '',
      type: 'SPEAKING',
      meetingUrl: '',
      location: '',
      scheduledAt: new Date(),
      duration: 30,
      maxParticipants: 8,
      pointsRequired: 0,
      isActive: true,
      isRecurring: false,
      recurringWeeks: 4,
      updateAllRecurring: false,
    });
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLimit = parseInt(event.target.value, 10);
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      isActive: '',
      isRecurring: '',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Function to format date without seconds
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

   const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    // Set both dates to midnight
    date.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Past";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 7) return `In ${diffDays} days`;
    return `In ${Math.ceil(diffDays / 7)} weeks`;
  };

  // Function to get session status color and text
  const getSessionStatus = (session: Session) => {
    const now = new Date();
    const sessionDateTime = new Date(session.scheduledAt);
    const isPast = sessionDateTime <= now;
    const isToday = sessionDateTime.toDateString() === now.toDateString();
    const isFull = session.currentParticipants >= session.maxParticipants;
    const isUpcoming = sessionDateTime > now;

    if (isPast) {
      return { color: 'default', text: 'Completed', icon: <Schedule /> };
    }
    if (!session.isActive) {
      return { color: 'error', text: 'Inactive', icon: <Visibility /> };
    }
    if (isFull) {
      return { color: 'warning', text: 'Full', icon: <People /> };
    }
    if (isToday && isUpcoming) {
      return { color: 'success', text: 'Today', icon: <CalendarMonth /> };
    }
    if (isUpcoming) {
      return { color: 'primary', text: 'Open', icon: <PersonAdd /> };
    }
    return { color: 'default', text: 'Completed', icon: <Schedule /> };
  };

  // Calculate enhanced stats
  const totalBookings = sessions.reduce((sum, s) => sum + s.currentParticipants, 0);
  const averageFillRate = sessions.length > 0
    ? Math.round(
        sessions.reduce((sum, s) => sum + (s.currentParticipants / s.maxParticipants) * 100, 0) /
        sessions.length
      )
    : 0;
  const recurringCount = sessions.filter(s => s.isRecurring).length;
  const activeFiltersCount = Object.values(filters).filter(f => f !== '').length;

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <Typography variant="h6">Loading sessions...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Session Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage speaking sessions and special events with pagination and recurring options
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Mic />}
              onClick={() => {
                setSessionForm({ ...sessionForm, type: 'SPEAKING' });
                setSessionDialog(true);
              }}
            >
              Speaking Session
            </Button>
            <Button
              variant="contained"
              startIcon={<Event />}
              onClick={() => {
                setSessionForm({ ...sessionForm, type: 'EVENT' });
                setSessionDialog(true);
              }}
              sx={{ color: "white" }}
            >
              Special Event
            </Button>
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Enhanced Stats */}
        <Grid container spacing={3} mb={4}>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4" fontWeight={700} color="primary">
                      {pagination.total}
                    </Typography>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                      <Schedule />
                    </Avatar>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Total Sessions
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Across all pages
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4" fontWeight={700} color="secondary">
                      {totalBookings}
                    </Typography>
                    <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>
                      <People />
                    </Avatar>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Current Page Bookings
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    From displayed sessions
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4" fontWeight={700} color="success.main">
                      {averageFillRate}%
                    </Typography>
                    <Avatar sx={{ bgcolor: 'success.main', width: 40, height: 40 }}>
                      <Star />
                    </Avatar>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Fill Rate
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Current page average
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4" fontWeight={700} color="warning.main">
                      {recurringCount}
                    </Typography>
                    <Avatar sx={{ bgcolor: 'warning.main', width: 40, height: 40 }}>
                      <Repeat />
                    </Avatar>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Recurring Sessions
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    On current page
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4" fontWeight={700} color="info.main">
                      {pagination.page}
                    </Typography>
                    <Avatar sx={{ bgcolor: 'info.main', width: 40, height: 40 }}>
                      <CalendarMonth />
                    </Avatar>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Current Page
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    of {pagination.totalPages} pages
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters and Pagination Controls */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack spacing={3}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight={600}>
                  Filter & Pagination
                </Typography>
                {activeFiltersCount > 0 && (
                  <Button size="small" onClick={clearFilters}>
                    Clear Filters ({activeFiltersCount})
                  </Button>
                )}
              </Stack>
              
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Session Type</InputLabel>
                    <Select
                      value={filters.type}
                      label="Session Type"
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                    >
                      <MenuItem value="">All Types</MenuItem>
                      <MenuItem value="SPEAKING">Speaking Sessions</MenuItem>
                      <MenuItem value="EVENT">Special Events</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.isActive}
                      label="Status"
                      onChange={(e) => handleFilterChange('isActive', e.target.value)}
                    >
                      <MenuItem value="">All Status</MenuItem>
                      <MenuItem value="true">Active</MenuItem>
                      <MenuItem value="false">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Recurring</InputLabel>
                    <Select
                      value={filters.isRecurring}
                      label="Recurring"
                      onChange={(e) => handleFilterChange('isRecurring', e.target.value)}
                    >
                      <MenuItem value="">All Sessions</MenuItem>
                      <MenuItem value="true">Recurring Only</MenuItem>
                      <MenuItem value="false">One-time Only</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Items per page"
                    value={pagination.limit}
                    onChange={handleLimitChange}
                    inputProps={{ min: 5, max: 50 }}
                  />
                </Grid>
              </Grid>
            </Stack>
          </CardContent>
        </Card>

        {/* Sessions Table */}
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight={600}>
                Sessions ({pagination.total} total)
              </Typography>
              <Pagination
                count={pagination.totalPages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Stack>

            {sessions.length === 0 ? (
              <Alert severity="info" sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" gutterBottom>
                  No sessions found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {activeFiltersCount > 0 
                    ? 'Try adjusting your filters or create a new session.'
                    : 'Create your first session to get started!'
                  }
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setSessionDialog(true)}
                  sx={{ color: "white" }}
                >
                  Create Session
                </Button>
              </Alert>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Session Details</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Date & Time</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Participants</TableCell>
                        <TableCell>Points</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sessions.map((session) => {
                        const isPast = new Date(session.scheduledAt) < new Date();
                        const status = getSessionStatus(session);
                        const fillPercentage = (session.currentParticipants / session.maxParticipants) * 100;
                        
                        return (
                          <TableRow key={session.id} sx={{ opacity: isPast ? 0.8 : 1 }}>
                            <TableCell>
                              <Stack spacing={1}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Typography variant="body2" fontWeight={600}>
                                    {session.title}
                                  </Typography>
                                  {session.isRecurring && (
                                    <Tooltip title={session.recurringParentId ? "Part of recurring series" : "Recurring session parent"}>
                                      <Chip
                                        icon={<Repeat />}
                                        label={session.recurringParentId ? "Series" : `${session.recurringWeeks}w`}
                                        size="small"
                                        color="info"
                                        variant="outlined"
                                      />
                                    </Tooltip>
                                  )}
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  {session.type === 'SPEAKING' ? (
                                    <>
                                      <VideoCall sx={{ fontSize: 16, color: 'text.secondary' }} />
                                      <Typography variant="caption" color="text.secondary">
                                        Online Meeting
                                      </Typography>
                                    </>
                                  ) : session.location ? (
                                    <>
                                      <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                                      <Typography variant="caption" color="text.secondary">
                                        {session.location}
                                      </Typography>
                                    </>
                                  ) : (
                                    <>
                                      <Event sx={{ fontSize: 16, color: 'text.secondary' }} />
                                      <Typography variant="caption" color="text.secondary">
                                        Special Event
                                      </Typography>
                                    </>
                                  )}
                                </Stack>
                                {session.hostName && (
                                  <Typography variant="caption" color="text.secondary">
                                    Host: {session.hostName}
                                  </Typography>
                                )}
                                <Tooltip title={getRelativeTime(session.scheduledAt)}>
                                  <Typography variant="caption" color="primary.main" sx={{ cursor: 'help' }}>
                                    {getRelativeTime(session.scheduledAt)}
                                  </Typography>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                {session.type === 'SPEAKING' ? <Mic sx={{ fontSize: 16 }} /> : <Event sx={{ fontSize: 16 }} />}
                                <Chip
                                  label={session.type === 'SPEAKING' ? 'Speaking' : 'Event'}
                                  size="small"
                                  color={session.type === 'SPEAKING' ? 'primary' : 'secondary'}
                                  sx={{ color: "white" }}
                                />
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Stack spacing={0.5}>
                                <Typography variant="body2" fontWeight={500}>
                                  {formatDateTime(session.scheduledAt)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(session.scheduledAt).toLocaleDateString('en-US', { weekday: 'long' })}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="body2">{session.duration} min</Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Stack spacing={1}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <People sx={{ fontSize: 16 }} />
                                  <Typography variant="body2" fontWeight={500}>
                                    {session.currentParticipants}/{session.maxParticipants}
                                  </Typography>
                                </Stack>
                                <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 4 }}>
                                  <Box
                                    sx={{
                                      width: `${Math.min(fillPercentage, 100)}%`,
                                      bgcolor: fillPercentage >= 100 ? 'error.main' : fillPercentage >= 80 ? 'warning.main' : 'success.main',
                                      height: '100%',
                                      borderRadius: 1,
                                      transition: 'width 0.3s ease',
                                    }}
                                  />
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                  {Math.round(fillPercentage)}% filled
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              {session.pointsRequired > 0 ? (
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                  <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                                  <Typography variant="body2" fontWeight={500}>
                                    {session.pointsRequired}
                                  </Typography>
                                </Stack>
                              ) : (
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                  <Typography variant="body2" color="success.main" fontWeight={500}>
                                    FREE
                                  </Typography>
                                </Stack>
                              )}
                            </TableCell>
                            <TableCell>
                              <Stack spacing={0.5} alignItems="flex-start">
                                <Chip
                                  label={status.text}
                                  size="small"
                                  color={status.color as any}
                                  icon={status.icon}
                                  sx={{ color: 'white' }}
                                />
                              </Stack>
                            </TableCell>
                            <TableCell align="right">
                              <Stack direction="row" spacing={0.5}>
                                <Tooltip title="Edit session">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setEditingSession(session);
                                      setSessionForm({
                                        title: session.title,
                                        description: session.description,
                                        type: session.type,
                                        meetingUrl: session.meetingUrl || '',
                                        location: session.location || '',
                                        scheduledAt: new Date(session.scheduledAt),
                                        duration: session.duration,
                                        maxParticipants: session.maxParticipants,
                                        pointsRequired: session.pointsRequired,
                                        isActive: session.isActive,
                                        isRecurring: session.isRecurring,
                                        recurringWeeks: session.recurringWeeks || 4,
                                        updateAllRecurring: false,
                                      });
                                      setSessionDialog(true);
                                    }}
                                  >
                                    <Edit />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete session">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteSession(session.id, session)}
                                  >
                                    <Delete />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {/* Bottom Pagination */}
                <Stack direction="row" justifyContent="center" mt={3}>
                  <Pagination
                    count={pagination.totalPages}
                    page={pagination.page}
                    onChange={handlePageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                    size="large"
                  />
                </Stack>
              </>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Session Dialog */}
        <Dialog 
          open={sessionDialog} 
          onClose={() => {
            setSessionDialog(false);
            setEditingSession(null);
            resetForm();
          }} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" spacing={2} alignItems="center">
              {sessionForm.type === 'SPEAKING' ? <Mic /> : <Event />}
              <Typography variant="h6">
                {editingSession 
                  ? `Edit ${sessionForm.type === 'SPEAKING' ? 'Speaking Session' : 'Special Event'}` 
                  : `Create New ${sessionForm.type === 'SPEAKING' ? 'Speaking Session' : 'Special Event'}`
                }
              </Typography>
              {editingSession?.isRecurring && (
                <Chip
                  icon={<Repeat />}
                  label="Recurring"
                  size="small"
                  color="info"
                  variant="outlined"
                />
              )}
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label={sessionForm.type === 'SPEAKING' ? 'Session Title' : 'Event Title'}
                value={sessionForm.title}
                onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                required
                placeholder={sessionForm.type === 'SPEAKING' ? 
                  'e.g., Morning Conversation Practice' : 
                  'e.g., Cultural Exchange Workshop'
                }
              />
                              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={sessionForm.description}
                onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })}
                required
                placeholder={sessionForm.type === 'SPEAKING' ? 
                  'Describe what participants will practice...' : 
                  'Describe the special event activities...'
                }
              />
              <FormControl fullWidth>
                <InputLabel>Session Type</InputLabel>
                <Select
                  value={sessionForm.type}
                  label="Session Type"
                  onChange={(e) => setSessionForm({ ...sessionForm, type: e.target.value as any })}
                >
                  <MenuItem value="SPEAKING">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Mic />
                      <span>Speaking Practice Session</span>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="EVENT">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Event />
                      <span>Special Event</span>
                    </Stack>
                  </MenuItem>
                </Select>
              </FormControl>
              
              {sessionForm.type === 'SPEAKING' ? (
                <TextField
                  fullWidth
                  label="Meeting URL"
                  value={sessionForm.meetingUrl}
                  onChange={(e) => setSessionForm({ ...sessionForm, meetingUrl: e.target.value })}
                  helperText="Google Meet URL will be generated if left empty"
                  placeholder="https://meet.google.com/..."
                />
              ) : (
                <TextField
                  fullWidth
                  label="Event Location"
                  value={sessionForm.location}
                  onChange={(e) => setSessionForm({ ...sessionForm, location: e.target.value })}
                  placeholder="e.g., Community Center Room A, or Online"
                />
              )}

              <DateTimePicker
                label="Date & Time"
                value={sessionForm.scheduledAt}
                onChange={(newValue) =>
                  newValue && setSessionForm({ ...sessionForm, scheduledAt: newValue })
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText: 'Select when this session will take place',
                  },
                }}
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Duration (minutes)"
                    value={sessionForm.duration}
                    onChange={(e) => setSessionForm({ ...sessionForm, duration: parseInt(e.target.value) || 30 })}
                    inputProps={{ min: 15, max: 180 }}
                    helperText="15-180 minutes"
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Max Participants"
                    value={sessionForm.maxParticipants}
                    onChange={(e) => setSessionForm({ ...sessionForm, maxParticipants: parseInt(e.target.value) || 1 })}
                    inputProps={{ min: 1, max: 100 }}
                    helperText="1-100 people"
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                type="number"
                label="Points Required"
                value={sessionForm.pointsRequired}
                onChange={(e) => setSessionForm({ ...sessionForm, pointsRequired: parseInt(e.target.value) || 0 })}
                helperText="Set to 0 for free sessions. Premium sessions typically cost 10-50 points."
                inputProps={{ min: 0 }}
              />

              {/* Recurring Session Options */}
              {!editingSession && (
                <>
                  <Divider />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={sessionForm.isRecurring}
                        onChange={(e) => setSessionForm({ ...sessionForm, isRecurring: e.target.checked })}
                      />
                    }
                    label={
                      <Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Repeat />
                          <Typography variant="body2">Recurring Session</Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          Create multiple sessions repeating weekly
                        </Typography>
                      </Stack>
                    }
                  />

                  {sessionForm.isRecurring && (
                    <TextField
                      fullWidth
                      type="number"
                      label="Number of Weeks"
                      value={sessionForm.recurringWeeks}
                      onChange={(e) => setSessionForm({ ...sessionForm, recurringWeeks: parseInt(e.target.value) || 4 })}
                      inputProps={{ min: 2, max: 52 }}
                      helperText={`Will create ${sessionForm.recurringWeeks} sessions, one each week starting from the selected date`}
                    />
                  )}
                </>
              )}

              {/* Update All Recurring Option for Existing Sessions */}
              {editingSession?.isRecurring && !editingSession.recurringParentId && (
                <>
                  <Divider />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={sessionForm.updateAllRecurring}
                        onChange={(e) => setSessionForm({ ...sessionForm, updateAllRecurring: e.target.checked })}
                      />
                    }
                    label={
                      <Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Timeline />
                          <Typography variant="body2">Update All in Series</Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          Apply changes to all sessions in this recurring series
                        </Typography>
                      </Stack>
                    }
                  />
                </>
              )}

              <FormControlLabel
                control={
                  <Switch
                    checked={sessionForm.isActive}
                    onChange={(e) => setSessionForm({ ...sessionForm, isActive: e.target.checked })}
                  />
                }
                label={
                  <Stack>
                    <Typography variant="body2">Active Session</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {sessionForm.isActive ? 'Participants can book this session' : 'Session is hidden from participants'}
                    </Typography>
                  </Stack>
                }
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={() => {
                setSessionDialog(false);
                setEditingSession(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSaveSession}
              disabled={!sessionForm.title || !sessionForm.description}
              sx={{ color: "white" }}
              startIcon={editingSession ? <Edit /> : <Add />}
            >
              {editingSession 
                ? (editingSession.isRecurring && sessionForm.updateAllRecurring ? 'Update Series' : 'Update Session')
                : (sessionForm.isRecurring ? `Create ${sessionForm.recurringWeeks} Sessions` : 'Create Session')
              }
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
};