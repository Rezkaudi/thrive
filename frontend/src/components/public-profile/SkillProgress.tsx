import {
  Box,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { PublicProfile } from "../../types/public-profile.types";

interface ISkillProgressProps {
  learningStats: PublicProfile["learningStats"];
}

export const SkillProgress = ({ learningStats }: ISkillProgressProps) => {
  return (
    <Grid size={{ xs: 12, md: 6 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Skill Progress
          </Typography>
          <Stack spacing={3}>
            {learningStats.map((skill) => (
              <Box key={skill.skill}>
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" fontWeight={500}>
                    {skill.skill}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {skill.level}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={skill.level}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "action.hover",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 4,
                      backgroundColor: skill.color,
                    },
                  }}
                />
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );
};
