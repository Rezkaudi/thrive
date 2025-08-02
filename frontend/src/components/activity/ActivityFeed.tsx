import React from 'react';
import {
    Stack,
    Paper,
    Typography,
    Avatar,
    Box,
    Chip,
    Skeleton,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    School,
    Forum,
    EmojiEvents,
    VideoCall,
    CheckCircle,
    Star,
    TrendingUp,
    PersonAdd,
    Edit,
    BookOnline,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { RecentActivity } from '../../services/dashboardService';

const activityIcons: Record<string, React.ReactElement> = {
    USER_REGISTERED: <PersonAdd color="primary" />,
    LESSON_COMPLETED: <School color="success" />,
    POST_CREATED: <Forum color="info" />,
    SESSION_BOOKED: <VideoCall color="warning" />,
    SESSION_ATTENDED: <VideoCall color="success" />,
    COURSE_COMPLETED: <BookOnline color="secondary" />,
    ACHIEVEMENT_EARNED: <EmojiEvents sx={{ color: '#FFD700' }} />,
    POINTS_EARNED: <Star sx={{ color: '#FFD700' }} />,
    LEVEL_UP: <TrendingUp color="primary" />,
    PROFILE_UPDATED: <Edit color="action" />,
};

const activityColors: Record<string, string> = {
    USER_REGISTERED: '#5C633A',
    LESSON_COMPLETED: '#4CAF50',
    POST_CREATED: '#2196F3',
    SESSION_BOOKED: '#FF9800',
    SESSION_ATTENDED: '#4CAF50',
    COURSE_COMPLETED: '#9C27B0',
    ACHIEVEMENT_EARNED: '#FFD700',
    POINTS_EARNED: '#FFD700',
    LEVEL_UP: '#5C633A',
    PROFILE_UPDATED: '#757575',
};

interface ActivityFeedProps {
    activities: RecentActivity[];
    loading?: boolean;
    showUser?: boolean;
    compact?: boolean;
    maxItems?: number;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
    activities,
    loading = false,
    showUser = false,
    compact = false,
    maxItems,
}) => {
    const displayActivities = maxItems ? activities?.slice(0, maxItems) : activities;

    if (loading) {
        return (
            <Stack spacing={2}>
                {[1, 2, 3].map((index) => (
                    <Paper key={index} sx={{ p: 2 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Skeleton variant="circular" width={40} height={40} />
                            <Box flex={1}>
                                <Skeleton variant="text" width="60%" />
                                <Skeleton variant="text" width="40%" />
                            </Box>
                        </Stack>
                    </Paper>
                ))}
            </Stack>
        );
    }

    if (activities?.length === 0) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    No recent activity
                </Typography>
            </Paper>
        );
    }

    return (
        <AnimatePresence>
            <Stack spacing={compact ? 1 : 2}>
                {displayActivities?.map((activity, index) => (
                    <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Paper
                            sx={{
                                p: compact ? 1.5 : 2,
                                '&:hover': { bgcolor: 'action.hover' },
                                transition: 'background-color 0.2s',
                            }}
                        >
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar
                                    sx={{
                                        bgcolor: `${activityColors[activity.activityType]}20`,
                                        color: activityColors[activity.activityType],
                                        width: compact ? 32 : 40,
                                        height: compact ? 32 : 40,
                                    }}
                                >
                                    {activityIcons[activity.activityType] || <CheckCircle />}
                                </Avatar>

                                <Box flex={1}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        {showUser && activity.user && (
                                            <>
                                                <Avatar
                                                    src={activity.user.profilePhoto}
                                                    sx={{ width: 20, height: 20 }}
                                                >
                                                    {activity.user.name[0]}
                                                </Avatar>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {activity.user.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    •
                                                </Typography>
                                            </>
                                        )}
                                        <Typography variant={compact ? "body2" : "body1"} fontWeight={500}>
                                            {activity.title}
                                        </Typography>
                                    </Stack>

                                    {activity.description && !compact && (
                                        <Typography variant="body2" color="text.secondary">
                                            {activity.description}
                                        </Typography>
                                    )}

                                    <Typography variant="caption" color="text.secondary">
                                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                    </Typography>
                                </Box>

                                {activity.metadata?.points && (
                                    <Chip
                                        label={`+${activity.metadata.points}`}
                                        size="small"
                                        color="success"
                                        sx={{ fontWeight: 600 }}
                                    />
                                )}
                            </Stack>
                        </Paper>
                    </motion.div>
                ))}
            </Stack>
        </AnimatePresence>
    );
};