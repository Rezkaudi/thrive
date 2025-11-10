import React from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";

export const ClassroomHeader = () => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
    <Box sx={{ textAlign: "center", mb: 6 }}>
      <Typography
        variant="h2"
        gutterBottom
        fontWeight={800}
        sx={{
          background: "linear-gradient(135deg, #5C633A 0%, #D4BC8C 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          mb: 2,
        }}
      >
        Welcome to the Classroom
      </Typography>
      <Typography
        variant="h6"
        color="text.secondary"
        sx={{
          mb: 4,
          maxWidth: 600,
          mx: "auto",
          lineHeight: 1.6,
        }}
      >
        All the tools to Thrive at your fingertips . . .
      </Typography>
    </Box>
  </motion.div>
);
