// frontend/src/pages/admin/CommunityModeration.tsx - Updated with pagination
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Pagination,
  CircularProgress,
} from '@mui/material';
import {
  Search,
  Flag,
  CheckCircle,
  Delete,
  Block,
  MoreVert,
  Campaign,
  ThumbUp,
  Comment,
  Share,
} from '@mui/icons-material';
import api from '../../services/api';
import { announcementService } from '../../services/announcementService';
import { useSweetAlert } from '../../utils/sweetAlert';

interface Post {
  id: string;
  userId: string;
  content: string;
  mediaUrls: string[];
  likesCount: number;
  createdAt: string;
  isFlagged?: boolean;
  author?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

interface Announcement {
  id: string;
  author?: {
    userId: string;
    name: string;
    email: string;
    avatar: string;
    level: number;
  };
  content: string;
  likesCount: number;
  isLiked: boolean;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  isFlagged?: boolean;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
}

export const CommunityModeration: React.FC = () => {
  const { showConfirm, showError } = useSweetAlert();
  const [posts, setPosts] = useState<Post[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [announcementDialog, setAnnouncementDialog] = useState(false);
  const [announcementContent, setAnnouncementContent] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  // Pagination states
  const [announcementsPagination, setAnnouncementsPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10 // Items per page
  });

  const [postsPagination, setPostsPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10 // Items per page
  });

  const [flaggedPagination, setFlaggedPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10 // Items per page
  });

  useEffect(() => {
    fetchData();
  }, [tabValue]);

  // Reset pagination when tab changes
  useEffect(() => {
    if (tabValue === 0) {
      setAnnouncementsPagination(prev => ({ ...prev, currentPage: 1 }));
    } else if (tabValue === 1) {
      setPostsPagination(prev => ({ ...prev, currentPage: 1 }));
    } else if (tabValue === 2) {
      setFlaggedPagination(prev => ({ ...prev, currentPage: 1 }));
    }
  }, [tabValue]);

  // Fetch data when pagination changes
  useEffect(() => {
    if (tabValue === 0) {
      fetchAnnouncements(announcementsPagination.currentPage);
    }
  }, [announcementsPagination.currentPage]);

  useEffect(() => {
    if (tabValue === 1) {
      fetchPosts(postsPagination.currentPage);
    }
  }, [postsPagination.currentPage]);

  useEffect(() => {
    if (tabValue === 2) {
      fetchFlaggedContent(flaggedPagination.currentPage);
    }
  }, [flaggedPagination.currentPage]);

  const fetchAnnouncements = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await announcementService.getAnnouncements(page, announcementsPagination.limit);
      setAnnouncements(response.announcements);
      setAnnouncementsPagination(prev => ({
        ...prev,
        currentPage: page,
        totalPages: response.totalPages || Math.ceil(response.total / prev.limit),
        total: response.total
      }));
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      showError('Error', 'Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/community/posts?page=${page}&limit=${postsPagination.limit}`);
      setPosts(response.data.posts || []);
      setPostsPagination(prev => ({
        ...prev,
        currentPage: page,
        totalPages: response.data.totalPages || Math.ceil(response.data.total / prev.limit),
        total: response.data.total || 0
      }));
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      showError('Error', 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchFlaggedContent = async (page: number = 1) => {
    try {
      setLoading(true);
      const [flaggedPosts, flaggedAnnouncements] = await Promise.all([
        api.get(`/admin/posts/flagged?page=${page}&limit=${Math.ceil(flaggedPagination.limit / 2)}`).catch(() => ({ data: { posts: [], total: 0, totalPages: 0 } })),
        api.get(`/admin/announcements/flagged?page=${page}&limit=${Math.ceil(flaggedPagination.limit / 2)}`).catch(() => ({ data: { announcements: [], total: 0, totalPages: 0 } }))
      ]);
      
      setPosts(flaggedPosts.data.posts || []);
      setAnnouncements(flaggedAnnouncements.data.announcements || []);
      
      const totalItems = (flaggedPosts.data.total || 0) + (flaggedAnnouncements.data.total || 0);
      setFlaggedPagination(prev => ({
        ...prev,
        currentPage: page,
        totalPages: Math.ceil(totalItems / prev.limit),
        total: totalItems
      }));
    } catch (error) {
      console.error('Failed to fetch flagged content:', error);
      showError('Error', 'Failed to fetch flagged content');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    if (tabValue === 0) {
      await fetchAnnouncements(1);
    } else if (tabValue === 1) {
      await fetchPosts(1);
    } else if (tabValue === 2) {
      await fetchFlaggedContent(1);
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    if (tabValue === 0) {
      setAnnouncementsPagination(prev => ({ ...prev, currentPage: page }));
    } else if (tabValue === 1) {
      setPostsPagination(prev => ({ ...prev, currentPage: page }));
    } else if (tabValue === 2) {
      setFlaggedPagination(prev => ({ ...prev, currentPage: page }));
    }
  };

  const getCurrentPagination = () => {
    if (tabValue === 0) return announcementsPagination;
    if (tabValue === 1) return postsPagination;
    return flaggedPagination;
  };

  const handlePostAction = async (action: string, item: Post | Announcement, isAnnouncement: boolean = false) => {
    let confirmResult;
    let successMessage = '';
    let errorMessage = '';

    switch (action) {
      case 'delete':
        confirmResult = await showConfirm({
          title: `Delete ${isAnnouncement ? 'Announcement' : 'Post'}`,
          text: `Are you sure you want to delete this ${isAnnouncement ? 'announcement' : 'post'}? This action cannot be undone.`,
          icon: 'warning',
          confirmButtonText: 'Yes, delete it',
          cancelButtonText: 'Cancel',
        });
        
        if (confirmResult.isConfirmed) {
          try {
            if (isAnnouncement) {
              await announcementService.deleteAnnouncement(item.id);
            } else {
              await api.delete(`/admin/posts/${item.id}`);
            }
            successMessage = `${isAnnouncement ? 'Announcement' : 'Post'} deleted successfully`;
            
            // Refresh current page data
            if (tabValue === 0) {
              fetchAnnouncements(announcementsPagination.currentPage);
            } else if (tabValue === 1) {
              fetchPosts(postsPagination.currentPage);
            } else {
              fetchFlaggedContent(flaggedPagination.currentPage);
            }
            
            setSnackbar({
              open: true,
              message: successMessage,
              severity: 'success'
            });
          } catch (error) {
            console.error(`Failed to delete ${isAnnouncement ? 'announcement' : 'post'}:`, error);
            showError('Error', `Failed to delete ${isAnnouncement ? 'announcement' : 'post'}`);
          }
        }
        break;
        
      case 'unflag':
        confirmResult = await showConfirm({
          title: `Unflag ${isAnnouncement ? 'Announcement' : 'Post'}`,
          text: `Are you sure you want to unflag this ${isAnnouncement ? 'announcement' : 'post'}?`,
          icon: 'question',
          confirmButtonText: 'Yes, unflag it',
          cancelButtonText: 'Cancel',
        });
        
        if (confirmResult.isConfirmed) {
          try {
            const endpoint = isAnnouncement ? `/admin/announcements/${item.id}/unflag` : `/admin/posts/${item.id}/unflag`;
            await api.post(endpoint);
            successMessage = `${isAnnouncement ? 'Announcement' : 'Post'} unflagged successfully`;
            
            // Refresh current page data
            if (tabValue === 0) {
              fetchAnnouncements(announcementsPagination.currentPage);
            } else if (tabValue === 1) {
              fetchPosts(postsPagination.currentPage);
            } else {
              fetchFlaggedContent(flaggedPagination.currentPage);
            }
            
            setSnackbar({
              open: true,
              message: successMessage,
              severity: 'success'
            });
          } catch (error) {
            console.error(`Failed to unflag ${isAnnouncement ? 'announcement' : 'post'}:`, error);
            showError('Error', `Failed to unflag ${isAnnouncement ? 'announcement' : 'post'}`);
          }
        }
        break;
        
      case 'blockUser':
        const userId = isAnnouncement ? (item as Announcement).author?.userId : (item as Post).userId;
        const userName = isAnnouncement ? (item as Announcement).author?.name : (item as Post).author?.name;
        
        confirmResult = await showConfirm({
          title: 'Block User',
          text: `Are you sure you want to block ${userName || 'this user'}? They will not be able to access the platform.`,
          icon: 'warning',
          confirmButtonText: 'Yes, block user',
          cancelButtonText: 'Cancel',
        });
        
        if (confirmResult.isConfirmed) {
          try {
            await api.put(`/admin/users/${userId}/status`, { isActive: false });
            successMessage = 'User blocked successfully';
            
            // Refresh current page data
            if (tabValue === 0) {
              fetchAnnouncements(announcementsPagination.currentPage);
            } else if (tabValue === 1) {
              fetchPosts(postsPagination.currentPage);
            } else {
              fetchFlaggedContent(flaggedPagination.currentPage);
            }
            
            setSnackbar({
              open: true,
              message: successMessage,
              severity: 'success'
            });
          } catch (error) {
            console.error('Failed to block user:', error);
            showError('Error', 'Failed to block user');
          }
        }
        break;
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!announcementContent.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter announcement content',
        severity: 'error'
      });
      return;
    }
    
    try {
      const newAnnouncement = await announcementService.createAnnouncement({ content: announcementContent });
      
      setSnackbar({
        open: true,
        message: 'Announcement posted successfully!',
        severity: 'success'
      });
      setAnnouncementDialog(false);
      setAnnouncementContent('');
      
      // Refresh announcements data
      if (tabValue === 0) {
        fetchAnnouncements(1); // Go to first page to see the new announcement
        setAnnouncementsPagination(prev => ({ ...prev, currentPage: 1 }));
      }
    } catch (error) {
      console.error('Failed to create announcement:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create announcement',
        severity: 'error'
      });
    }
  };

  const getFilteredItems = () => {
    if (tabValue === 0) {
      return announcements.filter(announcement =>
        announcement.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.author?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else if (tabValue === 1) {
      return posts.filter(post =>
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      // Flagged content - combine both
      const filteredPosts = posts.filter(post =>
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const filteredAnnouncements = announcements.filter(announcement =>
        announcement.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.author?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return [...filteredAnnouncements.map(a => ({ ...a, isAnnouncement: true })), ...filteredPosts.map(p => ({ ...p, isAnnouncement: false }))];
    }
  };

  const ItemCard = ({ item, isAnnouncement = false }: { item: any; isAnnouncement?: boolean }) => {
    const [itemAnchorEl, setItemAnchorEl] = useState<null | HTMLElement>(null);
    
    return (
      <Card sx={{ 
        mb: 2, 
        ...(isAnnouncement && {
          border: "2px solid",
          borderColor: "primary.main",
        }),
        position: 'relative',
        overflow: 'hidden',
      }}>
        <CardContent sx={{ pb: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="start">
            <Stack direction="row" spacing={2}>
              <Avatar
                src={item.author?.avatar || undefined}
                sx={{ width: 48, height: 48 }}
              >
                {!item.author?.avatar && (item.author?.name?.[0] || item.author?.email?.[0]?.toUpperCase())}
              </Avatar>
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                  <Typography 
                    variant="subtitle1" 
                    fontWeight={600}
                    sx={{ color: "#2D3436" }}
                  >
                    {item.author?.name || 'Unknown User'}
                  </Typography>
                  {isAnnouncement && (
                    <Chip 
                      icon={<Campaign />} 
                      label="Announcement" 
                      size="small" 
                      color="primary"
                    />
                  )}
                  {item.isFlagged && (
                    <Chip 
                      icon={<Flag />} 
                      label="Flagged" 
                      size="small" 
                      color="error"
                    />
                  )}
                </Stack>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ fontSize: "0.8rem" }}
                >
                  {item.author?.email} • {new Date(item.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })} {new Date(item.createdAt).toLocaleTimeString("en-US", {minute: "2-digit", hour: "2-digit"})}
                </Typography>
              </Box>
            </Stack>
            <Box sx={{ position: 'relative' }}>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setItemAnchorEl(e.currentTarget);
                }}
                sx={{ 
                  color: "text.secondary",
                  "&:hover": {
                    color: "text.primary",
                    bgcolor: "action.hover",
                  },
                }}
              >
                <MoreVert />
              </IconButton>
              <Menu
                anchorEl={itemAnchorEl}
                open={Boolean(itemAnchorEl)}
                onClose={() => setItemAnchorEl(null)}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem 
                  onClick={() => {
                    setItemAnchorEl(null);
                    handlePostAction('delete', item, isAnnouncement);
                  }}
                  sx={{ color: 'error.main' }}
                >
                  <Delete sx={{ mr: 1.5 }} /> Delete {isAnnouncement ? 'Announcement' : 'Post'}
                </MenuItem>
                {item.isFlagged && (
                  <MenuItem 
                    onClick={() => {
                      setItemAnchorEl(null);
                      handlePostAction('unflag', item, isAnnouncement);
                    }}
                    sx={{ color: 'success.main' }}
                  >
                    <CheckCircle sx={{ mr: 1.5 }} /> Unflag {isAnnouncement ? 'Announcement' : 'Post'}
                  </MenuItem>
                )}
                <MenuItem 
                  onClick={() => {
                    setItemAnchorEl(null);
                    handlePostAction('blockUser', item, isAnnouncement);
                  }}
                  sx={{ color: 'warning.main' }}
                >
                  <Block sx={{ mr: 1.5 }} /> Block User
                </MenuItem>
              </Menu>
            </Box>
          </Stack>

          <Typography 
            variant="body1" 
            sx={{ 
              mt: 2, 
              mb: 2,
              whiteSpace: "pre-wrap"
            }}
          >
            {item.content}
          </Typography>

          {/* Media display for posts */}
          {!isAnnouncement && item.mediaUrls && item.mediaUrls.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {item.mediaUrls.slice(0, 3).map((url: string, index: number) => (
                  <Box
                    key={index}
                    component="img"
                    src={url}
                    alt={`Media ${index + 1}`}
                    sx={{
                      width: 100,
                      height: 100,
                      objectFit: 'cover',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  />
                ))}
                {item.mediaUrls.length > 3 && (
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.100',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      +{item.mediaUrls.length - 3} more
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          )}

          {/* Likes and Comments Display */}
          <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={3} sx={{ color: 'text.secondary', alignItems: 'center' }}>
              {/* Likes Count */}
              <Stack direction="row" spacing={0.5} alignItems="center">
                <ThumbUp sx={{ fontSize: '1rem' }} />
                <Typography variant="body2" component="span" fontWeight="500">
                  {item.likesCount}
                </Typography>
              </Stack>
              
              {/* Comments Count */}
              {item.commentsCount !== undefined && (
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Comment sx={{ fontSize: '1rem' }} />
                  <Typography variant="body2" component="span" fontWeight="500">
                    {item.commentsCount}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const filteredItems = getFilteredItems();
  const currentPagination = getCurrentPagination();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight={700}>
          Community Moderation
        </Typography>
        <Button
          variant="contained"
          startIcon={<Campaign />}
          onClick={() => setAnnouncementDialog(true)}
        >
          Create Announcement
        </Button>
      </Stack>

      {tabValue === 2 && filteredItems.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {currentPagination.total} items require review
        </Alert>
      )}

      <Card>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search content..."
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

          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
            <Tab 
              label={`Announcements ${currentPagination.total > 0 && tabValue === 0 ? `(${currentPagination.total})` : ''}`} 
            />
            <Tab 
              label={`Posts ${currentPagination.total > 0 && tabValue === 1 ? `(${currentPagination.total})` : ''}`} 
            />
            <Tab 
              label="Flagged Content" 
              icon={<Flag />} 
              iconPosition="end"
            />
          </Tabs>

          <Box>
            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : filteredItems.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" py={4}>
                No {tabValue === 0 ? 'announcements' : tabValue === 1 ? 'posts' : 'flagged content'} found
              </Typography>
            ) : (
              <>
                {filteredItems.map((item: any) => (
                  <ItemCard 
                    key={item.id} 
                    item={item} 
                    isAnnouncement={tabValue === 0 || item.isAnnouncement} 
                  />
                ))}

                {/* Pagination */}
                {currentPagination.totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                      count={currentPagination.totalPages}
                      page={currentPagination.currentPage}
                      onChange={handlePageChange}
                      color="primary"
                      size="large"
                      showFirstButton
                      showLastButton
                      sx={{
                        '& .MuiPaginationItem-root': {
                          fontSize: '1rem',
                          fontWeight: 500,
                        },
                        '& .Mui-selected': {
                          backgroundColor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'primary.dark',
                          },
                        },
                      }}
                    />
                  </Box>
                )}

                {/* Pagination Info */}
                {currentPagination.total > 0 && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Showing {((currentPagination.currentPage - 1) * currentPagination.limit) + 1} to{' '}
                      {Math.min(currentPagination.currentPage * currentPagination.limit, currentPagination.total)} of{' '}
                      {currentPagination.total} results
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Announcement Dialog */}
      <Dialog
        open={announcementDialog}
        onClose={() => setAnnouncementDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Announcement</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Write your announcement..."
            value={announcementContent}
            onChange={(e) => setAnnouncementContent(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnnouncementDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateAnnouncement}
            disabled={!announcementContent.trim()}
          >
            Post Announcement
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