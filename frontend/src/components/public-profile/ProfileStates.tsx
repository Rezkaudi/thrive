import { Box, CircularProgress, Container, Card, CardContent, Alert, Button } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export const ProfileLoading = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
    <CircularProgress />
  </Box>
);

export const ProfileError = ({ error }: { error: string }) => {
  const navigate = useNavigate();
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Card>
        <CardContent sx={{ textAlign: "center", py: 6 }}>
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
          <Button variant="contained" startIcon={<ArrowBack />} onClick={() => navigate("/")}>
            Go Home
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};