import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Collapse,
  Divider,
  Badge,
  Tooltip,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Search,
  MoreVert,
  FilterList,
  Block,
  CheckCircle,
  ArrowUpward,
  ArrowDownward,
  Close,
  RestartAlt,
  CalendarMonth,
  Person,
  Star,
  School,
  CreditCard,
  ToggleOn,
} from '@mui/icons-material';
import api from '../../services/api';
import { useSweetAlert } from '../../utils/sweetAlert';

// ── Filter Types ───────────────────────────────────────────────────────────────
interface FilterState {
  roles: string[];
  statuses: string[];
  subscriptions: string[];
  languageLevels: string[];
  dateFrom: string;
  dateTo: string;
  pointsMin: string;
  pointsMax: string;
  levelMin: string;
  levelMax: string;
}

const INITIAL_FILTERS: FilterState = {
  roles: [],
  statuses: [],
  subscriptions: [],
  languageLevels: [],
  dateFrom: '',
  dateTo: '',
  pointsMin: '',
  pointsMax: '',
  levelMin: '',
  levelMax: '',
};

const ROLE_OPTIONS = ['ADMIN', 'STUDENT'];
const STATUS_OPTIONS = ['Active', 'Inactive'];
const SUBSCRIPTION_OPTIONS = ['active', 'trialing', 'canceled', 'No Subscription'];
const LANGUAGE_LEVEL_OPTIONS = ['N5', 'N4', 'N3', 'N2', 'N1'];

type SortField = 'joined' | 'points' | 'level' | 'name';

// ── Reusable FilterChipGroup ───────────────────────────────────────────────────
const FilterChipGroup: React.FC<{
  label: string;
  icon: React.ReactElement;
  options: string[];
  selected: string[];
  onChange: (value: string[]) => void;
  colorMap?: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'>;
}> = ({ label, icon, options, selected, onChange, colorMap }) => {
  const theme = useTheme();

  const handleToggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <Box>
      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
        {React.cloneElement(icon as React.ReactElement<any>, { sx: { fontSize: 18, color: theme.palette.text.secondary } })}
        <Typography variant="caption" fontWeight={600} color="text.secondary" textTransform="uppercase" letterSpacing={0.5}>
          {label}
        </Typography>
      </Stack>
      <Stack direction="row" flexWrap="wrap" gap={0.75}>
        {options.map((option) => {
          const isSelected = selected.includes(option);
          const chipColor = colorMap?.[option] || 'default';
          return (
            <Chip
              key={option}
              label={option}
              size="small"
              clickable
              variant={isSelected ? 'filled' : 'outlined'}
              color={isSelected ? chipColor : 'default'}
              onClick={() => handleToggle(option)}
              sx={{
                fontWeight: isSelected ? 600 : 400,
                borderWidth: isSelected ? 0 : 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
                },
              }}
            />
          );
        })}
      </Stack>
    </Box>
  );
};

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
  subscriptionStatus: string;
}

export const UserManagement: React.FC = () => {
  const theme = useTheme();
  const { showConfirm, showError } = useSweetAlert();
  const [users, setUsers] = useState<User[]>([]);
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
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  // ── Filter State ───────────────────────────────────────────────────────────
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>('joined');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchUsers = useCallback(async () => {
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
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
        severity: 'success',
      });
      setPointsDialog(false);
      setPointsData({ points: 0, reason: '' });
      fetchUsers();
    } catch (error) {
      console.error('Failed to adjust points:', error);
      showError('Error', 'Failed to adjust points');
    }
  };

  // ── Filter Helpers ─────────────────────────────────────────────────────────
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setSearchQuery('');
    setPage(0);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.roles.length > 0) count++;
    if (filters.statuses.length > 0) count++;
    if (filters.subscriptions.length > 0) count++;
    if (filters.languageLevels.length > 0) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.pointsMin || filters.pointsMax) count++;
    if (filters.levelMin || filters.levelMax) count++;
    return count;
  }, [filters]);

  // ── Active Filter Tags (for chips display) ────────────────────────────────
  const activeFilterTags = useMemo(() => {
    const tags: { key: string; label: string; onRemove: () => void }[] = [];

    filters.roles.forEach((role) =>
      tags.push({
        key: `role-${role}`,
        label: `Role: ${role}`,
        onRemove: () => updateFilter('roles', filters.roles.filter((r) => r !== role)),
      })
    );
    filters.statuses.forEach((status) =>
      tags.push({
        key: `status-${status}`,
        label: `Status: ${status}`,
        onRemove: () => updateFilter('statuses', filters.statuses.filter((s) => s !== status)),
      })
    );
    filters.subscriptions.forEach((sub) =>
      tags.push({
        key: `sub-${sub}`,
        label: `Subscription: ${sub}`,
        onRemove: () => updateFilter('subscriptions', filters.subscriptions.filter((s) => s !== sub)),
      })
    );
    filters.languageLevels.forEach((lvl) =>
      tags.push({
        key: `lang-${lvl}`,
        label: `Language: ${lvl}`,
        onRemove: () => updateFilter('languageLevels', filters.languageLevels.filter((l) => l !== lvl)),
      })
    );
    if (filters.dateFrom)
      tags.push({
        key: 'dateFrom',
        label: `From: ${filters.dateFrom}`,
        onRemove: () => updateFilter('dateFrom', ''),
      });
    if (filters.dateTo)
      tags.push({
        key: 'dateTo',
        label: `To: ${filters.dateTo}`,
        onRemove: () => updateFilter('dateTo', ''),
      });
    if (filters.pointsMin)
      tags.push({
        key: 'pointsMin',
        label: `Points ≥ ${filters.pointsMin}`,
        onRemove: () => updateFilter('pointsMin', ''),
      });
    if (filters.pointsMax)
      tags.push({
        key: 'pointsMax',
        label: `Points ≤ ${filters.pointsMax}`,
        onRemove: () => updateFilter('pointsMax', ''),
      });
    if (filters.levelMin)
      tags.push({
        key: 'levelMin',
        label: `Level ≥ ${filters.levelMin}`,
        onRemove: () => updateFilter('levelMin', ''),
      });
    if (filters.levelMax)
      tags.push({
        key: 'levelMax',
        label: `Level ≤ ${filters.levelMax}`,
        onRemove: () => updateFilter('levelMax', ''),
      });

    return tags;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // ── Filtering + Sorting ────────────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        // Search
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          !query ||
          user.email.toLowerCase().includes(query) ||
          user.profile?.name?.toLowerCase().includes(query);

        // Role
        const matchesRole =
          filters.roles.length === 0 || filters.roles.includes(user.role);

        // Status
        const matchesStatus =
          filters.statuses.length === 0 ||
          (filters.statuses.includes('Active') && user.isActive) ||
          (filters.statuses.includes('Inactive') && !user.isActive);

        // Subscription
        const matchesSub =
          filters.subscriptions.length === 0 ||
          filters.subscriptions.includes(user.subscriptionStatus);

        // Language Level
        const matchesLang =
          filters.languageLevels.length === 0 ||
          filters.languageLevels.includes(user.profile?.languageLevel || 'N5');

        // Date Range
        const joinedDate = new Date(user.createdAt).getTime();
        const matchesDateFrom =
          !filters.dateFrom || joinedDate >= new Date(filters.dateFrom).getTime();
        const matchesDateTo =
          !filters.dateTo || joinedDate <= new Date(filters.dateTo + 'T23:59:59').getTime();

        // Points Range
        const userPoints = user.profile?.points || 0;
        const matchesPointsMin =
          !filters.pointsMin || userPoints >= Number(filters.pointsMin);
        const matchesPointsMax =
          !filters.pointsMax || userPoints <= Number(filters.pointsMax);

        // Level Range
        const userLevel = user.profile?.level || 1;
        const matchesLevelMin =
          !filters.levelMin || userLevel >= Number(filters.levelMin);
        const matchesLevelMax =
          !filters.levelMax || userLevel <= Number(filters.levelMax);

        return (
          matchesSearch &&
          matchesRole &&
          matchesStatus &&
          matchesSub &&
          matchesLang &&
          matchesDateFrom &&
          matchesDateTo &&
          matchesPointsMin &&
          matchesPointsMax &&
          matchesLevelMin &&
          matchesLevelMax
        );
      })
      .sort((a, b) => {
        let valA: number;
        let valB: number;

        switch (sortField) {
          case 'name':
            const nameA = (a.profile?.name || a.email).toLowerCase();
            const nameB = (b.profile?.name || b.email).toLowerCase();
            return sortOrder === 'asc'
              ? nameA.localeCompare(nameB)
              : nameB.localeCompare(nameA);
          case 'points':
            valA = a.profile?.points || 0;
            valB = b.profile?.points || 0;
            break;
          case 'level':
            valA = a.profile?.level || 1;
            valB = b.profile?.level || 1;
            break;
          case 'joined':
          default:
            valA = new Date(a.createdAt).getTime();
            valB = new Date(b.createdAt).getTime();
            break;
        }

        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });
  }, [users, searchQuery, filters, sortField, sortOrder]);

  const handleSortToggle = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const SortIndicator: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? (
      <ArrowUpward sx={{ fontSize: 16 }} />
    ) : (
      <ArrowDownward sx={{ fontSize: 16 }} />
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          User Management
        </Typography>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
          </Typography>
          <Tooltip title={filtersOpen ? 'Hide filters' : 'Show filters'}>
            <Badge
              badgeContent={activeFilterCount}
              color="primary"
              overlap="circular"
              sx={{ '& .MuiBadge-badge': { fontSize: 11, minWidth: 18, height: 18 } }}
            >
              <Button
                variant={filtersOpen ? 'contained' : 'outlined'}
                startIcon={<FilterList />}
                onClick={() => setFiltersOpen(!filtersOpen)}
                sx={{ minWidth: 100 }}
              >
                Filters
              </Button>
            </Badge>
          </Tooltip>
        </Stack>
      </Stack>

      {/* ── Collapsible Filter Panel ────────────────────────────────────────── */}
      <Collapse in={filtersOpen} timeout={300}>
        <Paper
          variant="outlined"
          sx={{
            mb: 3,
            p: 3,
            borderRadius: 3,
            borderColor: alpha(theme.palette.primary.main, 0.2),
            background: alpha(theme.palette.primary.main, 0.02),
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
            <Typography variant="subtitle1" fontWeight={600}>
              Filter Users
            </Typography>
            <Stack direction="row" spacing={1}>
              {activeFilterCount > 0 && (
                <Button
                  size="small"
                  startIcon={<RestartAlt />}
                  onClick={resetFilters}
                  color="inherit"
                  sx={{ textTransform: 'none' }}
                >
                  Reset All
                </Button>
              )}
              <IconButton size="small" onClick={() => setFiltersOpen(false)}>
                <Close fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>

          {/* Row 1: Categorical filters */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
              gap: 3,
              mb: 3,
            }}
          >
            <FilterChipGroup
              label="Role"
              icon={<Person />}
              options={ROLE_OPTIONS}
              selected={filters.roles}
              onChange={(val) => updateFilter('roles', val)}
              colorMap={{ ADMIN: 'error', STUDENT: 'primary' }}
            />
            <FilterChipGroup
              label="Account Status"
              icon={<ToggleOn />}
              options={STATUS_OPTIONS}
              selected={filters.statuses}
              onChange={(val) => updateFilter('statuses', val)}
              colorMap={{ Active: 'success', Inactive: 'default' }}
            />
            <FilterChipGroup
              label="Subscription"
              icon={<CreditCard />}
              options={SUBSCRIPTION_OPTIONS}
              selected={filters.subscriptions}
              onChange={(val) => updateFilter('subscriptions', val)}
              colorMap={{ active: 'info', trialing: 'warning', canceled: 'error', 'No Subscription': 'default' }}
            />
            <FilterChipGroup
              label="Language Level"
              icon={<School />}
              options={LANGUAGE_LEVEL_OPTIONS}
              selected={filters.languageLevels}
              onChange={(val) => updateFilter('languageLevels', val)}
              colorMap={{ N1: 'error', N2: 'warning', N3: 'info', N4: 'primary', N5: 'default' }}
            />
          </Box>

          <Divider sx={{ mb: 2.5 }} />

          {/* Row 2: Range filters */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
              gap: 3,
            }}
          >
            {/* Date Range */}
            <Box>
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
                <CalendarMonth sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                <Typography variant="caption" fontWeight={600} color="text.secondary" textTransform="uppercase" letterSpacing={0.5}>
                  Joined Date Range
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.5}>
                <TextField
                  type="date"
                  size="small"
                  label="From"
                  value={filters.dateFrom}
                  onChange={(e) => updateFilter('dateFrom', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  type="date"
                  size="small"
                  label="To"
                  value={filters.dateTo}
                  onChange={(e) => updateFilter('dateTo', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Stack>
            </Box>

            {/* Points Range */}
            <Box>
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
                <Star sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                <Typography variant="caption" fontWeight={600} color="text.secondary" textTransform="uppercase" letterSpacing={0.5}>
                  Points Range
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.5}>
                <TextField
                  type="number"
                  size="small"
                  label="Min"
                  value={filters.pointsMin}
                  onChange={(e) => updateFilter('pointsMin', e.target.value)}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  fullWidth
                />
                <TextField
                  type="number"
                  size="small"
                  label="Max"
                  value={filters.pointsMax}
                  onChange={(e) => updateFilter('pointsMax', e.target.value)}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  fullWidth
                />
              </Stack>
            </Box>

            {/* Level Range */}
            <Box>
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
                <School sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                <Typography variant="caption" fontWeight={600} color="text.secondary" textTransform="uppercase" letterSpacing={0.5}>
                  Level Range
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.5}>
                <TextField
                  type="number"
                  size="small"
                  label="Min"
                  value={filters.levelMin}
                  onChange={(e) => updateFilter('levelMin', e.target.value)}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  fullWidth
                />
                <TextField
                  type="number"
                  size="small"
                  label="Max"
                  value={filters.levelMax}
                  onChange={(e) => updateFilter('levelMax', e.target.value)}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  fullWidth
                />
              </Stack>
            </Box>
          </Box>
        </Paper>
      </Collapse>

      {/* ── Active Filter Chips ─────────────────────────────────────────────── */}
      {activeFilterTags.length > 0 && !filtersOpen && (
        <Stack direction="row" flexWrap="wrap" gap={1} mb={2} alignItems="center">
          <Typography variant="caption" color="text.secondary" fontWeight={600} mr={0.5}>
            Active filters:
          </Typography>
          {activeFilterTags.map((tag) => (
            <Chip
              key={tag.key}
              label={tag.label}
              size="small"
              onDelete={tag.onRemove}
              deleteIcon={<Close sx={{ fontSize: 14 }} />}
              sx={{
                borderRadius: 2,
                fontWeight: 500,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                '& .MuiChip-deleteIcon': {
                  color: theme.palette.text.secondary,
                  '&:hover': { color: theme.palette.error.main },
                },
              }}
            />
          ))}
          <Chip
            label="Clear all"
            size="small"
            variant="outlined"
            onClick={resetFilters}
            sx={{ fontWeight: 500, borderStyle: 'dashed' }}
          />
        </Stack>
      )}

      {/* ── Main Table Card ─────────────────────────────────────────────────── */}
      <Card>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <Close fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSortToggle('name')}
                  >
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography variant="body2" fontWeight={600}>User</Typography>
                      <SortIndicator field="name" />
                    </Stack>
                  </TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell
                    sx={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSortToggle('points')}
                  >
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography variant="body2" fontWeight={600}>Points</Typography>
                      <SortIndicator field="points" />
                    </Stack>
                  </TableCell>
                  <TableCell
                    sx={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSortToggle('level')}
                  >
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography variant="body2" fontWeight={600}>Level</Typography>
                      <SortIndicator field="level" />
                    </Stack>
                  </TableCell>
                  <TableCell>Language</TableCell>
                  <TableCell>Subscription</TableCell>
                  <TableCell
                    sx={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSortToggle('joined')}
                  >
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography variant="body2" fontWeight={600}>Joined</Typography>
                      <SortIndicator field="joined" />
                    </Stack>
                  </TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                      <Stack alignItems="center" spacing={1}>
                        <FilterList sx={{ fontSize: 40, color: 'text.disabled' }} />
                        <Typography color="text.secondary">
                          No users match the current filters
                        </Typography>
                        {activeFilterCount > 0 && (
                          <Button size="small" onClick={resetFilters}>
                            Clear filters
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: 14 }}>
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
                      <TableCell>
                        <Chip
                          label={user.subscriptionStatus}
                          size="small"
                          color={
                            user.subscriptionStatus === 'active'
                              ? 'info'
                              : user.subscriptionStatus === 'No Subscription'
                              ? 'default'
                              : 'warning'
                          }
                        />
                      </TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setAnchorEl(e.currentTarget);
                            setSelectedUser(user);
                          }}
                        >
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredUsers.length}
            page={page}
            onPageChange={(_e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </CardContent>
      </Card>

      {/* ── Action Menu ─────────────────────────────────────────────────────── */}
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

      {/* ── Points Adjustment Dialog ────────────────────────────────────────── */}
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
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
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

      {/* ── Snackbar ────────────────────────────────────────────────────────── */}
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