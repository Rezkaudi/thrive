import { Box, Container } from "@mui/material";

export const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      background: "linear-gradient(135deg, #5C633A 0%, #D4BC8C 100%)",
      position: "relative",
      overflow: "hidden",
    }}
  >
    {/* Decorative Backgrounds moved here */}
    <Box
      sx={{
        position: "absolute",
        top: -200,
        right: -200,
        width: 400,
        height: 400,
        borderRadius: "50%",
        background: "rgba(255, 255, 255, 0.1)",
      }}
    />
    <Box
      sx={{
        position: "absolute",
        bottom: -300,
        left: -300,
        width: 600,
        height: 600,
        borderRadius: "50%",
        background: "rgba(255, 255, 255, 0.05)",
      }}
    />

    <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
      {children}
    </Container>
  </Box>
);
