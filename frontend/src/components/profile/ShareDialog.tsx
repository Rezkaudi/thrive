import {
  Close,
  ContentCopy,
  Facebook,
  LinkedIn,
  Twitter,
  WhatsApp,
} from "@mui/icons-material";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

export interface IShareDialogProps {
  open: boolean;
  onClose: () => void;
  shareUrl: string;
  setSnackbar: React.Dispatch<
    React.SetStateAction<{
      open: boolean;
      message: string;
      severity: "success" | "error";
    }>
  >;
}

export const ShareDialog = ({
  open,
  onClose,
  shareUrl,
  setSnackbar,
}: IShareDialogProps) => {
  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setSnackbar({
      open: true,
      message: "Profile URL copied to clipboard!",
      severity: "success",
    });
  };

  const shareToSocial = (platform: string) => {
    const message = `Check out my Japanese learning progress on Thrive in Japan!`;
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedMessage = encodeURIComponent(message);

    let shareUrl_platform = "";

    switch (platform) {
      case "facebook":
        shareUrl_platform = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "twitter":
        shareUrl_platform = `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`;
        break;
      case "linkedin":
        shareUrl_platform = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case "whatsapp":
        shareUrl_platform = `https://wa.me/?text=${encodedMessage} ${encodedUrl}`;
        break;
    }

    window.open(shareUrl_platform, "_blank", "width=600,height=400");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          Share Your Profile
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Share your learning progress with friends and family
            </Typography>
            <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography
                  variant="body2"
                  sx={{ flex: 1, wordBreak: "break-all" }}
                >
                  {shareUrl}
                </Typography>
                <IconButton onClick={copyShareUrl} size="small">
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
                onClick={() => shareToSocial("facebook")}
                sx={{
                  bgcolor: "#1877F2",
                  color: "white",
                  "&:hover": { bgcolor: "#166FE5" },
                }}
              >
                <Facebook />
              </IconButton>
              <IconButton
                onClick={() => shareToSocial("twitter")}
                sx={{
                  bgcolor: "#1DA1F2",
                  color: "white",
                  "&:hover": { bgcolor: "#1A91DA" },
                }}
              >
                <Twitter />
              </IconButton>
              <IconButton
                onClick={() => shareToSocial("linkedin")}
                sx={{
                  bgcolor: "#0A66C2",
                  color: "white",
                  "&:hover": { bgcolor: "#095BA8" },
                }}
              >
                <LinkedIn />
              </IconButton>
              <IconButton
                onClick={() => shareToSocial("whatsapp")}
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
  );
};
