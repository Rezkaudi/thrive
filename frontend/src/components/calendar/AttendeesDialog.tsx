import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Typography,
} from "@mui/material";
import { CalendarSession } from "../../services/calendarService";

interface Attendee {
  bookingId: string;
  name: string;
  profilePhoto?: string;
  level: number;
  languageLevel: string;
}

interface AttendeesDialogProps {
  open: boolean;
  onClose: () => void;
  session: CalendarSession | null;
  attendees: Attendee[];
}

export const AttendeesDialog: React.FC<AttendeesDialogProps> = ({
  open,
  onClose,
  session,
  attendees,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Session Attendees - {session?.title}</DialogTitle>
      <DialogContent>
        <List>
          {attendees.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              py={2}
            >
              No attendees yet
            </Typography>
          ) : (
            attendees.map((attendee, index) => (
              <React.Fragment key={attendee.bookingId}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar src={attendee.profilePhoto}>
                      {attendee.name[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={attendee.name}
                    secondary={`Level ${attendee.level} • ${attendee.languageLevel}`}
                  />
                </ListItem>
                {index < attendees.length - 1 && (
                  <Divider variant="inset" component="li" />
                )}
              </React.Fragment>
            ))
          )}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
