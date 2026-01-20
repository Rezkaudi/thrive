import React from "react";
import {
  Stack,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Link as MuiLink,
  Chip,
} from "@mui/material";
import { MoreVert } from "@mui/icons-material";
import { Campaign, Feedback as FeedbackIcon } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { formatPostDate, formatPostTime } from "../../utils/formatDateAndTime";

interface PostCardHeaderProps {
  userId?: string;
  name?: string;
  avatar?: string;
  level?: number;
  createdAt: string;
  isAnnouncement: boolean;
  isFeedback?: boolean;
  isEditing: boolean;
  onMenuClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  isDeleting: boolean;
  isOwnItem?: boolean;
}

export const PostCardHeader: React.FC<PostCardHeaderProps> = ({
  userId,
  name,
  avatar,
  level,
  createdAt,
  isAnnouncement,
  isFeedback,
  isEditing,
  onMenuClick,
  isDeleting,
  isOwnItem,
}) => {
  return (
    <Stack direction="row" spacing={2} alignItems="flex-start" mb={2}>
      <Badge
        badgeContent={level ? `L${level}` : undefined}
        color="primary"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Avatar
          src={avatar}
          sx={{ width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 } }}
        >
          {!avatar && name?.[0]}
        </Avatar>
      </Badge>

      <Stack direction="column" flexGrow={1} spacing={0.5}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Link
            to={`/profile/${userId}`}
            target="_blank"
            style={{ textDecoration: "none" }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{
                color: "#2D3436",
                "&:hover": {
                  color: "primary.main",
                },
                transition: "color 0.2s ease-in-out",
              }}
            >
              {name || "Unknown User"}
            </Typography>
          </Link>
          {isAnnouncement && (
            <Chip
              icon={<Campaign />}
              label="Announcement"
              size="small"
              color="primary"
            />
          )}
          {isFeedback && (
            <Chip
              icon={<FeedbackIcon />}
              label="Feedback"
              size="small"
              color="success"
            />
          )}
          {isEditing && (
            <Chip
              label="Editing..."
              size="small"
              color="info"
              variant="outlined"
            />
          )}
        </Stack>
        <Typography
          sx={{ fontSize: { xs: "0.75rem", md: "0.8rem" } }}
          color="text.secondary"
        >
          {formatPostDate(createdAt)} {formatPostTime(createdAt)}
        </Typography>
      </Stack>

      {isOwnItem && (
        <IconButton
          size="small"
          onClick={onMenuClick}
          disabled={isDeleting}
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
      )}
    </Stack>
  );
};

export default PostCardHeader;
