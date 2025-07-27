import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Stack,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Search,
  MoreVert,
  FilterList,
  Block,
  CheckCircle,
} from '@mui/icons-material';
import api from '../../services/api';
import { useSweetAlert } from '../../utils/sweetAlert';

interface User {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  profile?: {
    name: string;
    points: number;
    level: number;
    languageLevel: string;
  };
}

export const UserManagement: React.FC = () => {
  const { showConfirm, showError } = useSweetAlert();
  const [users, setUsers] = useState<User[]>([]);
  // const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pointsDialog, setPointsDialog] = useState(false);
  const [pointsData, setPointsData] = useState({ points: 0, reason: '' });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage]);

  const fetchUsers = async () => {
    try {
      // setLoading(true);
      const response = await api.get('/admin/users', {
        params: { page: page + 1, limit: rowsPerPage },
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      // setLoading(false);
    }
  };

  const handleUserAction = (action: string, user: User) => {
    setSelectedUser(user);
    setAnchorEl(null);

    switch (action) {
      case 'toggleStatus':
        toggleUserStatus(user);
        break;
      case 'adjustPoints':
        setPointsDialog(true);
        break;
      case 'changeRole':
        // Implement role change
        break;
    }
  };

  const toggleUserStatus = async (user: User) => {
    const action = user.isActive ? 'deactivate' : 'activate';
    const result = await showConfirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      text: `Are you sure you want to ${action} ${user.profile?.name || user.email}?`,
      icon: 'warning',
      confirmButtonText: `Yes, ${action}`,
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        await api.put(`/admin/users/${user.id}/status`, {
          isActive: !user.isActive,
        });
        setSnackbar({
          open: true,
          message: `User ${action}d successfully!`,
          severity: 'success'
        });
        fetchUsers();
      } catch (error) {
        console.error('Failed to update user status:', error);
        showError('Error', `Failed to ${action} user`);
      }
    }
  };

  const handlePointsAdjustment = async () => {
    if (!selectedUser || !pointsData.reason) {
      showError('Validation Error', 'Please provide a reason for the points adjustment');
      return;
    }

    if (pointsData.points === 0) {
      showError('Validation Error', 'Please enter a points value (positive or negative)');
      return;
    }

    try {
      await api.post(`/admin/users/${selectedUser.id}/points`, pointsData);
      setSnackbar({
        open: true,
        message: 'Points adjusted successfully!',
        severity: 'success'
      });
      setPointsDialog(false);
      setPointsData({ points: 0, reason: "" });
      fetchUsers();
    } catch (error) {
      console.error("Failed to adjust points:", error);
      showError("Error", "Failed to adjust points");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.profile?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight={700}>
          User Management
        </Typography>
        <Button variant="contained" startIcon={<FilterList />}>
          Filters
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Points</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell>Language</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {user.profile?.name?.[0] || user.email[0].toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {user.profile?.name || 'No name'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        color={user.role === 'ADMIN' ? 'error' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={user.isActive ? <CheckCircle /> : <Block />}
                        label={user.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={user.isActive ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{user.profile?.points || 0}</TableCell>
                    <TableCell>{user.profile?.level || 1}</TableCell>
                    <TableCell>{user.profile?.languageLevel || 'N5'}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => {
                          setAnchorEl(e.currentTarget);
                          setSelectedUser(user);
                        }}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={users.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleUserAction('toggleStatus', selectedUser!)}>
          {selectedUser?.isActive ? 'Deactivate User' : 'Activate User'}
        </MenuItem>
        <MenuItem onClick={() => handleUserAction('adjustPoints', selectedUser!)}>
          Adjust Points
        </MenuItem>
        <MenuItem onClick={() => handleUserAction('changeRole', selectedUser!)}>
          Change Role
        </MenuItem>
      </Menu>

      {/* Points Adjustment Dialog */}
      <Dialog open={pointsDialog} onClose={() => setPointsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Adjust Points for {selectedUser?.profile?.name || selectedUser?.email}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 2 }}>
            <Alert severity="info">
              Current points: {selectedUser?.profile?.points || 0}
            </Alert>
            <TextField
              fullWidth
              type="number"
              label="Points to Add/Remove"
              value={pointsData.points}
              onChange={(e) => setPointsData({ ...pointsData, points: parseInt(e.target.value) })}
              helperText="Use negative values to remove points"
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reason"
              value={pointsData.reason}
              onChange={(e) => setPointsData({ ...pointsData, reason: e.target.value })}
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPointsDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handlePointsAdjustment}
            disabled={!pointsData.reason}
          >
            Adjust Points
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
  );
};