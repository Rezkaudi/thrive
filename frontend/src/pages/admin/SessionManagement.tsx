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
}

export const SessionManagement: React.FC = () => {
  const { showConfirm, showError } = useSweetAlert();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionDialog, setSessionDialog] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
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
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all sessions for admin view
      const response = await api.get('/sessions', { 
        params: { 
          limit: 100,
          isActive: undefined // Get all sessions regardless of status
        } 
      });
      
      const sessionsData = response.data.sessions || response.data;
      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
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
        await api.put(`/admin/sessions/${editingSession.id}`, payload);
        setSnackbar({ 
          open: true, 
          message: 'Session updated successfully!', 
          severity: 'success' 
        });
      } else {
        await api.post('/admin/sessions', payload);
        setSnackbar({ 
          open: true, 
          message: 'Session created successfully!', 
          severity: 'success' 
        });
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

  const handleDeleteSession = async (sessionId: string) => {
    const result = await showConfirm({
      title: 'Delete Session',
      text: 'Are you sure you want to delete this session? This action cannot be undone.',
      icon: 'warning',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/sessions/${sessionId}`);
        setSnackbar({ 
          open: true, 
          message: 'Session has been deleted successfully!', 
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
    });
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
    const isPast = sessionDateTime <= now; // Changed to include exact time comparison
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

  // Filter sessions based on tab with proper datetime comparison
  const now = new Date();
  const upcomingSessions = sessions.filter(s => {
    const sessionDateTime = new Date(s.scheduledAt);
    return sessionDateTime > now;
  });
  const pastSessions = sessions.filter(s => {
    const sessionDateTime = new Date(s.scheduledAt);
    return sessionDateTime <= now;
  });
  const displayedSessions = tabValue === 0 ? sessions : tabValue === 1 ? upcomingSessions : pastSessions;

  // Calculate enhanced stats
  const totalBookings = sessions.reduce((sum, s) => sum + s.currentParticipants, 0);
  const averageFillRate = sessions.length > 0
    ? Math.round(
        sessions.reduce((sum, s) => sum + (s.currentParticipants / s.maxParticipants) * 100, 0) /
        sessions.length
      )
    : 0;
  const eventCount = sessions.filter(s => s.type === 'EVENT').length;
  const speakingCount = sessions.filter(s => s.type === 'SPEAKING').length;
  const todaySessions = sessions.filter(s => {
    const sessionDate = new Date(s.scheduledAt);
    const sessionDateTime = new Date(s.scheduledAt);
    return sessionDate.toDateString() === now.toDateString() && sessionDateTime > now;
  }).length;

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
              Manage speaking sessions and special events
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
                      {upcomingSessions.length}
                    </Typography>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                      <Schedule />
                    </Avatar>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Upcoming Sessions
                  </Typography>
                  {todaySessions > 0 && (
                    <Chip 
                      label={`${todaySessions} today`} 
                      size="small" 
                      color="success"
                      sx={{ alignSelf: 'flex-start' }}
                    />
                  )}
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
                    Total Bookings
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Across all sessions
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
                    Average Fill Rate
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Participation rate
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
                      {eventCount}
                    </Typography>
                    <Avatar sx={{ bgcolor: 'warning.main', width: 40, height: 40 }}>
                      <Event />
                    </Avatar>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Special Events
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    vs {speakingCount} speaking
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
                      {sessions.length}
                    </Typography>
                    <Avatar sx={{ bgcolor: 'info.main', width: 40, height: 40 }}>
                      <CalendarMonth />
                    </Avatar>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Total Sessions
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    All time
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Sessions Table */}
        <Card>
          <CardContent>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
              <Tab label={`All Sessions (${sessions.length})`} />
              <Tab label={`Upcoming (${upcomingSessions.length})`} />
              <Tab label={`Past (${pastSessions.length})`} />
            </Tabs>

            {displayedSessions.length === 0 ? (
              <Alert severity="info" sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" gutterBottom>
                  No sessions found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {tabValue === 0 ? 'Create your first session to get started!' : 
                   tabValue === 1 ? 'No upcoming sessions scheduled.' : 
                   'No past sessions found.'}
                </Typography>
                {tabValue !== 2 && (
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setSessionDialog(true)}
                    sx={{ color: "white" }}
                  >
                    Create Session
                  </Button>
                )}
              </Alert>
            ) : (
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
                    {displayedSessions.map((session) => {
                      const isPast = new Date(session.scheduledAt) < now;
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
                                  onClick={() => handleDeleteSession(session.id)}
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
              {editingSession ? 'Update Session' : 'Create Session'}
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