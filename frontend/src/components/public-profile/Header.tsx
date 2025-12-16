import { ArrowBack } from "@mui/icons-material";
import { Box, Button, Container, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        background: `white`,
        color: "dark",
        py: 2,
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/")}
            sx={{
              color: "white",
              background:
                "linear-gradient(135deg, #5C633A 0%, #D4BC8C 60%, #A6531C 100%)",
            }}
          >
            Back to Home
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};
