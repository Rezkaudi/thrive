import React from "react";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { Edit, Delete, Report } from "@mui/icons-material";

interface PostCardMenuProps {
  anchorEl: null | HTMLElement;
  open: boolean;
  onClose: () => void;
  isOwnItem: boolean;
  isEditing: boolean;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
}

export const PostCardMenu: React.FC<PostCardMenuProps> = ({
  anchorEl,
  open,
  onClose,
  isOwnItem,
  isEditing,
  isDeleting,
  onEdit,
  onDelete,
  onReport,
}) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      {isOwnItem && (
        <MenuItem onClick={onEdit} disabled={isEditing || isDeleting}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
      )}
      {isOwnItem && (
        <MenuItem
          onClick={onDelete}
          sx={{ color: "error.main" }}
          disabled={isDeleting}
        >
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      )}
      {!isOwnItem && (
        <MenuItem
          onClick={onReport}
          sx={{ color: "warning.main" }}
          disabled={isDeleting}
        >
          <ListItemIcon>
            <Report fontSize="small" color="warning" />
          </ListItemIcon>
          <ListItemText>Report</ListItemText>
        </MenuItem>
      )}
    </Menu>
  );
};

export default PostCardMenu;
