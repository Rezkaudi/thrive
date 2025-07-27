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
} from '@mui/material';
import {
  Search,
  Flag,
  CheckCircle,
  Delete,
  Block,
  MoreVert,
  Campaign,
} from '@mui/icons-material';
import api from '../../services/api';
import { useSweetAlert } from '../../utils/sweetAlert';

interface Post {
  id: string;
  userId: string;
  content: string;
  mediaUrls: string[];
  isAnnouncement: boolean;
  likesCount: number;
  createdAt: string;
  isFlagged?: boolean;
  author?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export const CommunityModeration: React.FC = () => {
  const { showConfirm, showError } = useSweetAlert();
  const [posts, setPosts] = useState<Post[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [announcementDialog, setAnnouncementDialog] = useState(false);
  const [announcementContent, setAnnouncementContent] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  useEffect(() => {
    fetchPosts();
  }, [tabValue]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let endpoint = '/community/posts';
      if (tabValue === 1) {
        endpoint = '/admin/posts/flagged';
      }
      const response = await api.get(endpoint);
      setPosts(response.data.posts || response.data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostAction = async (action: string, post: Post) => {
    
    let confirmResult;
    let successMessage = '';
    let errorMessage = '';

    switch (action) {
      case 'delete':
        confirmResult = await showConfirm({
          title: 'Delete Post',
          text: 'Are you sure you want to delete this post? This action cannot be undone.',
          icon: 'warning',
          confirmButtonText: 'Yes, delete it',
          cancelButtonText: 'Cancel',
        });
        
        if (confirmResult.isConfirmed) {
          try {
            await api.delete(`/admin/posts/${post.id}`);
            successMessage = 'Post deleted successfully';
            errorMessage = 'Failed to delete post';
            fetchPosts();
            setSnackbar({
              open: true,
              message: successMessage,
              severity: 'success'
            });
          } catch (error) {
            console.error(`Failed to ${action} post:`, error);
            showError('Error', errorMessage);
          }
        }
        break;
        
      case 'unflag':
        confirmResult = await showConfirm({
          title: 'Unflag Post',
          text: 'Are you sure you want to unflag this post?',
          icon: 'question',
          confirmButtonText: 'Yes, unflag it',
          cancelButtonText: 'Cancel',
        });
        
        if (confirmResult.isConfirmed) {
          try {
            await api.post(`/admin/posts/${post.id}/unflag`);
            successMessage = 'Post unflagged successfully';
            errorMessage = 'Failed to unflag post';
            fetchPosts();
            setSnackbar({
              open: true,
              message: successMessage,
              severity: 'success'
            });
          } catch (error) {
            console.error(`Failed to ${action} post:`, error);
            showError('Error', errorMessage);
          }
        }
        break;
        
      case 'blockUser':
        confirmResult = await showConfirm({
          title: 'Block User',
          text: `Are you sure you want to block ${post.author?.name || 'this user'}? They will not be able to access the platform.`,
          icon: 'warning',
          confirmButtonText: 'Yes, block user',
          cancelButtonText: 'Cancel',
        });
        
        if (confirmResult.isConfirmed) {
          try {
            await api.put(`/admin/users/${post.userId}/status`, { isActive: false });
            successMessage = 'User blocked successfully';
            errorMessage = 'Failed to block user';
            fetchPosts();
            setSnackbar({
              open: true,
              message: successMessage,
              severity: 'success'
            });
          } catch (error) {
            console.error(`Failed to ${action} post:`, error);
            showError('Error', errorMessage);
          }
        }
        break;
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!announcementContent.trim()) {
      showError('Validation Error', 'Please enter announcement content');
      return;
    }

    const result = await showConfirm({
      title: 'Create Announcement',
      text: 'Are you sure you want to post this announcement to the community?',
      icon: 'question',
      confirmButtonText: 'Yes, post it',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        await api.post('/admin/announcements', { content: announcementContent });
        setSnackbar({
          open: true,
          message: 'Announcement posted successfully!',
          severity: 'success'
        });
        setAnnouncementDialog(false);
        setAnnouncementContent('');
        fetchPosts();
      } catch (error) {
        console.error('Failed to create announcement:', error);
        showError('Error', 'Failed to create announcement');
      }
    }
  };

  const filteredPosts = posts.filter(post =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const PostCard = ({ post }: { post: Post }) => {
    const [postAnchorEl, setPostAnchorEl] = useState<null | HTMLElement>(null);
    
    return (
      <Card sx={{ mb: 2, border: post.isAnnouncement ? '2px solid' : '1px solid', borderColor: post.isAnnouncement ? 'primary.main' : 'divider' }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="start">
            <Stack direction="row" spacing={2}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {post.author?.name?.[0] || 'U'}
              </Avatar>
              <Box>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {post.author?.name || 'Unknown User'}
                  </Typography>
                  {post.isAnnouncement && (
                    <Chip icon={<Campaign />} label="Announcement" size="small" color="primary" />
                  )}
                  {post.isFlagged && (
                    <Chip icon={<Flag />} label="Flagged" size="small" color="error" />
                  )}
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {post.author?.email} • {new Date(post.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </Stack>
            <Box sx={{ position: 'relative' }}>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setPostAnchorEl(e.currentTarget);
                }}
              >
                <MoreVert />
              </IconButton>
              <Menu
                anchorEl={postAnchorEl}
                open={Boolean(postAnchorEl)}
                onClose={() => setPostAnchorEl(null)}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                sx={{
                  '& .MuiPaper-root': {
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    borderRadius: 2,
                    minWidth: 180,
                  }
                }}
              >
                <MenuItem 
                  onClick={() => {
                    setPostAnchorEl(null);
                    handlePostAction('delete', post);
                  }}
                  sx={{ 
                    color: 'error.main',
                    '&:hover': {
                      backgroundColor: 'error.lighter',
                    }
                  }}
                >
                  <Delete sx={{ mr: 1 }} /> Delete Post
                </MenuItem>
                {post.isFlagged && (
                  <MenuItem 
                    onClick={() => {
                      setPostAnchorEl(null);
                      handlePostAction('unflag', post);
                    }}
                    sx={{ 
                      color: 'success.main',
                      '&:hover': {
                        backgroundColor: 'success.lighter',
                      }
                    }}
                  >
                    <CheckCircle sx={{ mr: 1 }} /> Unflag Post
                  </MenuItem>
                )}
                <MenuItem 
                  onClick={() => {
                    setPostAnchorEl(null);
                    handlePostAction('blockUser', post);
                  }}
                  sx={{ 
                    color: 'warning.main',
                    '&:hover': {
                      backgroundColor: 'warning.lighter',
                    }
                  }}
                >
                  <Block sx={{ mr: 1 }} /> Block User
                </MenuItem>
              </Menu>
            </Box>
          </Stack>

          <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
            {post.content}
          </Typography>

          <Stack direction="row" spacing={2}>
            <Typography variant="caption" color="text.secondary">
              {post.likesCount} likes
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  };

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

      {tabValue === 1 && filteredPosts.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {filteredPosts.length} posts require review
        </Alert>
      )}

      <Card>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search posts..."
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
            <Tab label="All Posts" />
            <Tab label="Flagged Posts" icon={<Flag />} iconPosition="end" />
          </Tabs>

          <Box>
            {loading ? (
              <Typography>Loading...</Typography>
            ) : filteredPosts.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" py={4}>
                No posts found
              </Typography>
            ) : (
              filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
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