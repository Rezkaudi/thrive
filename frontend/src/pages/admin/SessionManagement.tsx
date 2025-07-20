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
  const { showConfirm, showSuccess, showError } = useSweetAlert();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionDialog, setSessionDialog] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
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
        showSuccess('Success', 'Session updated successfully');
      } else {
        await api.post('/admin/sessions', payload);
        showSuccess('Success', 'Session created successfully');
      }

      setSessionDialog(false);
      setEditingSession(null);
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
      fetchSessions();
    } catch (error: any) {
      console.error('Failed to save session:', error);
      showError('Error', error.response?.data?.error || 'Failed to save session');
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
        showSuccess('Deleted', 'Session has been deleted successfully');
        fetchSessions();
      } catch (error: any) {
        console.error('Failed to delete session:', error);
        showError('Error', error.response?.data?.error || 'Failed to delete session');
      }
    }
  };

  // Filter sessions based on tab
  const now = new Date();
  const upcomingSessions = sessions.filter(s => new Date(s.scheduledAt) > now);
  const pastSessions = sessions.filter(s => new Date(s.scheduledAt) <= now);
  const displayedSessions = tabValue === 0 ? sessions : tabValue === 1 ? upcomingSessions : pastSessions;

  // Calculate stats
  const totalBookings = sessions.reduce((sum, s) => sum + s.currentParticipants, 0);
  const averageFillRate = sessions.length > 0
    ? Math.round(
        sessions.reduce((sum, s) => sum + (s.currentParticipants / s.maxParticipants) * 100, 0) /
        sessions.length
      )
    : 0;
  const eventCount = sessions.filter(s => s.type === 'EVENT').length;

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography>Loading sessions...</Typography>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight={700}>
            Session Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setSessionDialog(true)}
          >
            Create Session
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Stats */}
        <Grid container spacing={3} mb={4}>
            <Grid size={{ xs: 12, sm:6, md: 3 }}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="h4" fontWeight={700} color="primary">
                    {upcomingSessions.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upcoming Sessions
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
            <Grid size={{ xs: 12, sm:6, md: 3 }}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="h4" fontWeight={700} color="secondary">
                    {sessions.reduce((sum, s) => sum + s.currentParticipants, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Bookings
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
            <Grid size={{ xs: 12, sm:6, md: 3 }}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="h4" fontWeight={700}>
                    {Math.round(
                      sessions.reduce((sum, s) => sum + (s.currentParticipants / s.maxParticipants) * 100, 0) /
                      sessions.length
                    )}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average Fill Rate
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
            <Grid size={{ xs: 12, sm:6, md: 3 }}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="h4" fontWeight={700}>
                    {sessions.filter((s) => s.type === 'EVENT').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Special Events
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
              <Alert severity="info">
                No sessions found. Create your first session to get started!
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Session</TableCell>
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
                      return (
                        <TableRow key={session.id} sx={{ opacity: isPast ? 0.7 : 1 }}>
                          <TableCell>
                            <Stack>
                              <Typography variant="body2" fontWeight={500}>
                                {session.title}
                              </Typography>
                              <Stack direction="row" spacing={1} alignItems="center">
                                {session.type === 'SPEAKING' ? (
                                  <>
                                    <VideoCall sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary">
                                      Online
                                    </Typography>
                                  </>
                                ) : session.location ? (
                                  <>
                                    <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary">
                                      {session.location}
                                    </Typography>
                                  </>
                                ) : null}
                              </Stack>
                              {session.hostName && (
                                <Typography variant="caption" color="text.secondary">
                                  Host: {session.hostName}
                                </Typography>
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={session.type}
                              size="small"
                              color={session.type === 'SPEAKING' ? 'primary' : 'secondary'}
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(session.scheduledAt).toLocaleString()}
                          </TableCell>
                          <TableCell>{session.duration} min</TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <People sx={{ fontSize: 16 }} />
                              <Typography variant="body2">
                                {session.currentParticipants}/{session.maxParticipants}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            {session.pointsRequired > 0 ? (
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                                <Typography variant="body2">{session.pointsRequired}</Typography>
                              </Stack>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Free
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Stack spacing={0.5}>
                              <Chip
                                label={session.isActive ? 'Active' : 'Inactive'}
                                size="small"
                                color={session.isActive ? 'success' : 'default'}
                              />
                              {isPast && (
                                <Chip
                                  label="Ended"
                                  size="small"
                                  color="default"
                                />
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell align="right">
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
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteSession(session.id)}
                            >
                              <Delete />
                            </IconButton>
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

        {/* Session Dialog */}
        <Dialog open={sessionDialog} onClose={() => setSessionDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingSession ? 'Edit Session' : 'Create New Session'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Session Title"
                value={sessionForm.title}
                onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                required
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={sessionForm.description}
                onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })}
                required
              />
              <FormControl fullWidth>
                <InputLabel>Session Type</InputLabel>
                <Select
                  value={sessionForm.type}
                  label="Session Type"
                  onChange={(e) => setSessionForm({ ...sessionForm, type: e.target.value as any })}
                >
                  <MenuItem value="SPEAKING">Speaking Practice</MenuItem>
                  <MenuItem value="EVENT">Special Event</MenuItem>
                </Select>
              </FormControl>
              
              {sessionForm.type === 'SPEAKING' ? (
                <TextField
                  fullWidth
                  label="Meeting URL"
                  value={sessionForm.meetingUrl}
                  onChange={(e) => setSessionForm({ ...sessionForm, meetingUrl: e.target.value })}
                  helperText="Google Meet URL will be generated if left empty"
                />
              ) : (
                <TextField
                  fullWidth
                  label="Location"
                  value={sessionForm.location}
                  onChange={(e) => setSessionForm({ ...sessionForm, location: e.target.value })}
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
                  },
                }}
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 6}}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Duration (minutes)"
                    value={sessionForm.duration}
                    onChange={(e) => setSessionForm({ ...sessionForm, duration: parseInt(e.target.value) || 30 })}
                    inputProps={{ min: 15, max: 180 }}
                  />
                </Grid>
                <Grid size={{ xs: 6}}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Max Participants"
                    value={sessionForm.maxParticipants}
                    onChange={(e) => setSessionForm({ ...sessionForm, maxParticipants: parseInt(e.target.value) || 1 })}
                    inputProps={{ min: 1, max: 100 }}
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                type="number"
                label="Points Required"
                value={sessionForm.pointsRequired}
                onChange={(e) => setSessionForm({ ...sessionForm, pointsRequired: parseInt(e.target.value) || 0 })}
                helperText="Set to 0 for free sessions"
                inputProps={{ min: 0 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={sessionForm.isActive}
                    onChange={(e) => setSessionForm({ ...sessionForm, isActive: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSessionDialog(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleSaveSession}
              disabled={!sessionForm.title || !sessionForm.description}
            >
              Save Session
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};