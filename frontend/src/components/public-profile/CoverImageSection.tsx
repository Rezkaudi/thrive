import { Box } from "@mui/material";

export const CoverImageSection = () => {
  return (
    <Box
      sx={{
        position: "relative",
        height: { xs: 200, md: 250 },
        background: `linear-gradient(135deg, #5C633A 0%, #D4BC8C 50%, #A6531C 100%)`,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.3)",
        }}
      />
    </Box>
  );
};
