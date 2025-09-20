import {
  CalendarMonth,
  Cancel,
  CloudUpload,
  Delete,
  Download,
  Edit,
  Language,
  PhotoCamera,
  SaveAlt,
  School,
  Settings,
  Share,
} from "@mui/icons-material";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Profile,
  PublicProfile,
  UpdateProfileData,
} from "../../services/profileService";
import { useEffect, useRef, useState } from "react";
import heic2any from "heic2any";
import {
  deleteProfilePhoto,
  updateProfile,
  uploadProfilePhoto,
} from "../../store/slices/profileSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { User } from "../../store/slices/authSlice";
import { ProfileCompletion } from "./ProfileCompletion";

interface IProfileHeaderProps {
  profile: Profile;
  publicProfileData: PublicProfile;
  setSettingsDialog: (settingDialog: boolean) => void;
  isMobile: boolean;
  user: User | null;
  setShareDialog: (state: boolean) => void;
  setSnackbar: React.Dispatch<
    React.SetStateAction<{
      open: boolean;
      message: string;
      severity: "success" | "error";
    }>
  >;
}

export const ProfileHeader = ({
  profile,
  publicProfileData,
  isMobile,
  user,
  setSettingsDialog,
  setSnackbar,
  setShareDialog,
}: IProfileHeaderProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const [editing, setEditing] = useState(false);
  const [photoMenuAnchor, setPhotoMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [certificateLoading, setCertificateLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { updateLoading, photoUploadLoading } = useSelector(
    (state: RootState) => state.profile
  );

  const [formData, setFormData] = useState<UpdateProfileData>({
    name: "",
    bio: "",
    languageLevel: "N5",
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        bio: profile.bio || "",
        languageLevel: profile.languageLevel || "N5",
      });
    }
  }, [profile]);

  // Calculate profile completion
  const profileCompletion = () => {
    let completed = 0;
    const total = 5;
    if (profile?.name) completed++;
    if (profile?.bio) completed++;
    if (profile?.profilePhoto) completed++;
    if (profile?.languageLevel) completed++;
    if ((profile?.points || 0) > 0) completed++;
    return (completed / total) * 100;
  };

  const handleSaveProfile = async () => {
    try {
      await dispatch(updateProfile(formData)).unwrap();
      setEditing(false);
      setSnackbar({
        open: true,
        message: "Profile updated successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        bio: profile.bio || "",
        languageLevel: profile.languageLevel || "N5",
      });
    }
    setEditing(false);
  };

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let file = event.target.files?.[0];
    if (!file) return;

    try {
      const isHeic =
        file.type === "image/heic" || file.name.toLowerCase().endsWith(".heic");
      if (isHeic) {
        const conversionResult: any = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.8,
        });
        const fileName = file.name.replace(/\.[^/.]+$/, "") + ".jpeg";
        file = new File([conversionResult], fileName, { type: "image/jpeg" });
      }
      await dispatch(uploadProfilePhoto(file)).unwrap();
      setSnackbar({
        open: true,
        message: "Profile photo updated successfully!",
        severity: "success",
      });
      setPhotoMenuAnchor(null);
    } catch (error) {
      console.error("Failed to upload photo:", error);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePhotoDelete = async () => {
    try {
      await dispatch(deleteProfilePhoto()).unwrap();
      setSnackbar({
        open: true,
        message: "Profile photo deleted successfully!",
        severity: "success",
      });
      setPhotoMenuAnchor(null);
    } catch (error) {
      console.error("Failed to delete photo:", error);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
    setPhotoMenuAnchor(null);
  };

  // Share Profile Functionality
  const handleShareProfile = () => {
    setShareDialog(true);
  };

  // Download Certificate Functionality
  const handleDownloadCertificate = async () => {
    setCertificateLoading(true);

    try {
      // Simulate certificate generation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create a mock certificate download
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Background
        ctx.fillStyle = "#f8f9fa";
        ctx.fillRect(0, 0, 800, 600);

        // Border
        ctx.strokeStyle = "#5C633A";
        ctx.lineWidth = 10;
        ctx.strokeRect(20, 20, 760, 560);

        // Title
        ctx.fillStyle = "#2c3e50";
        ctx.font = "bold 36px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Certificate of Achievement", 400, 120);

        // Subtitle
        ctx.font = "24px Arial";
        ctx.fillText("Thrive in Japan", 400, 160);

        // Name
        ctx.font = "bold 32px Arial";
        ctx.fillStyle = "#5C633A";
        ctx.fillText(profile?.name || "Student", 400, 250);

        // Description
        ctx.fillStyle = "#2c3e50";
        ctx.font = "20px Arial";
        ctx.fillText("has successfully completed", 400, 300);
        ctx.fillText(
          `${
            publicProfileData?.totalLessonsCompleted || 0
          } lessons in Japanese language learning`,
          400,
          330
        );

        // Level
        ctx.font = "bold 24px Arial";
        ctx.fillStyle = "#A6531C";
        ctx.fillText(
          `Current Level: JLPT ${profile?.languageLevel || "N5"}`,
          400,
          380
        );

        // Points
        ctx.fillStyle = "#FFD700";
        ctx.fillText(
          `Total Points Earned: ${
            publicProfileData?.totalPoints || profile?.points || 0
          }`,
          400,
          420
        );

        // Date
        ctx.fillStyle = "#2c3e50";
        ctx.font = "16px Arial";
        ctx.fillText(`Issued on: ${new Date().toLocaleDateString()}`, 400, 500);
      }

      // Download the certificate
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${
            profile?.name || "Student"
          }_Japanese_Learning_Certificate.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          setSnackbar({
            open: true,
            message: "Certificate downloaded successfully!",
            severity: "success",
          });
        }
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to generate certificate. Please try again.",
        severity: "error",
      });
    } finally {
      setCertificateLoading(false);
    }
  };

  // Settings Functionality
  const handleOpenSettings = () => {
    setSettingsDialog(true);
  };

  return (
    <Card sx={{ mb: 4, overflow: "visible" }}>
      <CardContent sx={{ p: { xs: 2, md: 4 } }}>
        <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="flex-start">
          <Grid
            size={{ xs: 12, md: 3 }}
            sx={{ textAlign: { xs: "center", md: "left" } }}
          >
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              badgeContent={
                <IconButton
                  size="small"
                  onClick={(e) => setPhotoMenuAnchor(e.currentTarget)}
                  disabled={photoUploadLoading}
                  sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    border: "3px solid white",
                    "&:hover": { bgcolor: "primary.dark" },
                  }}
                >
                  {photoUploadLoading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <PhotoCamera fontSize="small" />
                  )}
                </IconButton>
              }
            >
              <Avatar
                src={profile?.profilePhoto}
                sx={{
                  width: { xs: 100, sm: 120, md: 150 },
                  height: { xs: 100, sm: 120, md: 150 },
                  mx: "auto",
                  border: "4px solid white",
                  boxShadow: 3,
                }}
              >
                {profile?.name?.[0] || "U"}
              </Avatar>
            </Badge>

            {/* Photo Menu */}
            <Menu
              anchorEl={photoMenuAnchor}
              open={Boolean(photoMenuAnchor)}
              onClose={() => setPhotoMenuAnchor(null)}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem onClick={triggerFileInput}>
                <CloudUpload sx={{ mr: 1 }} />
                {profile?.profilePhoto ? "Update Photo" : "Upload Photo"}
              </MenuItem>
              {profile?.profilePhoto && (
                <MenuItem
                  onClick={handlePhotoDelete}
                  sx={{ color: "error.main" }}
                >
                  <Delete sx={{ mr: 1 }} />
                  Delete Photo
                </MenuItem>
              )}
            </Menu>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,.heic,.heif"
              style={{ display: "none" }}
              onChange={handlePhotoUpload}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            {editing ? (
              <Stack direction={{ xs: "column" }} spacing={2}>
                <TextField
                  fullWidth
                  label="Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={updateLoading}
                  error={!formData.name?.trim()}
                  helperText={!formData.name?.trim() ? "Name is required" : ""}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  disabled={updateLoading}
                  inputProps={{ maxLength: 500 }}
                  helperText={`${formData.bio?.length || 0}/500 characters`}
                />
                {/* <FormControl fullWidth disabled={updateLoading}>
                      <InputLabel>Language Level</InputLabel>
                      <Select
                        value={formData.languageLevel}
                        label="Language Level"
                        onChange={(e) => setFormData({ ...formData, languageLevel: e.target.value })}
                      >
                        <MenuItem value="N5">N5 - Beginner</MenuItem>
                        <MenuItem value="N4">N4 - Elementary</MenuItem>
                        <MenuItem value="N3">N3 - Intermediate</MenuItem>
                        <MenuItem value="N2">N2 - Advanced</MenuItem>
                        <MenuItem value="N1">N1 - Proficient</MenuItem>
                      </Select>
                    </FormControl> */}
              </Stack>
            ) : (
              <Stack spacing={2}>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography variant="h4" fontWeight={700}>
                      {profile?.name || "User"}
                    </Typography>
                    <Chip
                      icon={<Language />}
                      label={`JLPT ${profile?.languageLevel || "N5"}`}
                      color="primary"
                    />
                  </Stack>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {profile?.bio || "No bio yet. Tell us about yourself!"}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Chip
                    icon={<CalendarMonth />}
                    label={`Joined ${new Date(
                      profile?.createdAt || ""
                    ).toLocaleDateString()}`}
                  />
                  <Chip
                    icon={<School />}
                    label={`${user?.role || "Student"}`}
                  />
                </Stack>
              </Stack>
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Stack spacing={2} alignItems={{ xs: "center", md: "flex-end" }}>
              {editing ? (
                <>
                  <Button
                    variant="contained"
                    startIcon={
                      updateLoading ? (
                        <CircularProgress size={16} />
                      ) : (
                        <SaveAlt />
                      )
                    }
                    onClick={handleSaveProfile}
                    disabled={updateLoading || !formData.name?.trim()}
                    fullWidth={isMobile}
                  >
                    {updateLoading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancelEdit}
                    disabled={updateLoading}
                    fullWidth={isMobile}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={() => setEditing(true)}
                    fullWidth={isMobile}
                  >
                    Edit Profile
                  </Button>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Share Profile">
                      <IconButton onClick={handleShareProfile}>
                        <Share />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download Certificate">
                      <IconButton
                        onClick={handleDownloadCertificate}
                        disabled={certificateLoading}
                      >
                        {certificateLoading ? (
                          <CircularProgress size={20} />
                        ) : (
                          <Download />
                        )}
                      </IconButton>
                    </Tooltip>
                    {user?.role !== "ADMIN" && (
                      <Tooltip title="Settings">
                        <IconButton onClick={handleOpenSettings}>
                          <Settings />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </>
              )}
            </Stack>
          </Grid>
        </Grid>

        {/* Profile Completion */}
        <ProfileCompletion profileCompletion={profileCompletion} /> 
      </CardContent>
    </Card>
  );
};
