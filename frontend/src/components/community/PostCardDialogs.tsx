import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  TextField,
  Stack,
  Paper,
  Typography,
  IconButton,
  Box,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  ContentCopy,
  Close,
  Facebook,
  Twitter,
  LinkedIn,
  WhatsApp,
} from "@mui/icons-material";

interface PostCardDialogsProps {
  deleteDialogOpen: boolean;
  reportDialogOpen: boolean;
  shareDialogOpen: boolean;
  itemType: string;
  isDeleting: boolean;
  shareUrl: string;
  reportReason: string;
  onDeleteDialogClose: () => void;
  onReportDialogClose: () => void;
  onShareDialogClose: () => void;
  onDeleteConfirm: () => void;
  onReportSubmit: () => void;
  onCopyShareUrl: () => void;
  onReportReasonChange: (reason: string) => void;
  onShareToSocial: (platform: string) => void;
}

export const PostCardDialogs: React.FC<PostCardDialogsProps> = ({
  deleteDialogOpen,
  reportDialogOpen,
  shareDialogOpen,
  itemType,
  isDeleting,
  shareUrl,
  reportReason,
  onDeleteDialogClose,
  onReportDialogClose,
  onShareDialogClose,
  onDeleteConfirm,
  onReportSubmit,
  onCopyShareUrl,
  onReportReasonChange,
  onShareToSocial,
}) => {
  return (
    <>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={onDeleteDialogClose}>
        <DialogTitle>
          Delete {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this {itemType}? This action cannot
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onDeleteDialogClose} disabled={isDeleting}>Cancel</Button>
          <Button
            onClick={onDeleteConfirm}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={16} /> : undefined}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Dialog */}
      <Dialog
        open={shareDialogOpen}
        onClose={onShareDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            Share This {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
            <IconButton onClick={onShareDialogClose}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Share this {itemType} - the link will open the community page
                and highlight this {itemType}
              </Typography>
              <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography
                    variant="body2"
                    sx={{ flex: 1, wordBreak: "break-all" }}
                  >
                    {shareUrl}
                  </Typography>
                  <IconButton onClick={onCopyShareUrl} size="small">
                    <ContentCopy />
                  </IconButton>
                </Stack>
              </Paper>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Share on Social Media
              </Typography>
              <Stack direction="row" spacing={2}>
                <IconButton
                  onClick={() => onShareToSocial("facebook")}
                  sx={{
                    bgcolor: "#1877F2",
                    color: "white",
                    "&:hover": { bgcolor: "#166FE5" },
                  }}
                >
                  <Facebook />
                </IconButton>
                <IconButton
                  onClick={() => onShareToSocial("twitter")}
                  sx={{
                    bgcolor: "#1DA1F2",
                    color: "white",
                    "&:hover": { bgcolor: "#1A91DA" },
                  }}
                >
                  <Twitter />
                </IconButton>
                <IconButton
                  onClick={() => onShareToSocial("linkedin")}
                  sx={{
                    bgcolor: "#0A66C2",
                    color: "white",
                    "&:hover": { bgcolor: "#095BA8" },
                  }}
                >
                  <LinkedIn />
                </IconButton>
                <IconButton
                  onClick={() => onShareToSocial("whatsapp")}
                  sx={{
                    bgcolor: "#25D366",
                    color: "white",
                    "&:hover": { bgcolor: "#22C75D" },
                  }}
                >
                  <WhatsApp />
                </IconButton>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog
        open={reportDialogOpen}
        onClose={onReportDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Report {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please provide a reason for reporting this {itemType}:
          </DialogContentText>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder={`Describe why you're reporting this ${itemType}...`}
            value={reportReason}
            onChange={(e) => onReportReasonChange(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onReportDialogClose}>Cancel</Button>
          <Button
            onClick={onReportSubmit}
            color="warning"
            variant="contained"
            disabled={!reportReason.trim()}
          >
            Report
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PostCardDialogs;
