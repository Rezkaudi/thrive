import { CheckCircle } from "@mui/icons-material";
import { Avatar, Grid, List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { Milestone } from "../../pages/ProfilePage";


interface IOverviewProps {
  milestones: Milestone[]
}

export const Overview = ({milestones}: IOverviewProps) => {
  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Learning Journey
          </Typography>
          <List>
            {milestones.map((milestone, index) => (
              <ListItem
                key={milestone.id}
                sx={{
                  opacity: milestone.achieved ? 1 : 0.5,
                  "&::before":
                    milestone.achieved && index < milestones.length - 1
                      ? {
                          content: '""',
                          position: "absolute",
                          left: 28,
                          top: 48,
                          bottom: -48,
                          width: 2,
                          bgcolor: "primary.main",
                        }
                      : {},
                }}
              >
                <ListItemIcon>
                  <Avatar
                    sx={{
                      bgcolor: milestone.achieved
                        ? "primary.main"
                        : "action.hover",
                      width: 36,
                      height: 36,
                    }}
                  >
                    {milestone.achieved ? <CheckCircle /> : milestone.icon}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={milestone.title}
                  secondary={
                    <>
                      {milestone.description}
                      {milestone.date && (
                        <Typography
                          variant="caption"
                          display="block"
                          color="primary"
                        >
                          {milestone.date}
                        </Typography>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Grid>

        {/* <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Skills Overview
                      </Typography>
                      <Stack spacing={3}>
                        {publicProfileData?.learningStats?.map((skill: any) => (
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
                                backgroundColor: 'action.hover',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 4,
                                  backgroundColor: skill.color,
                                },
                              }}
                            />
                          </Box>
                        )) || [
                          // Fallback data if no real data available
                          { skill: 'Vocabulary', level: 60, color: '#5C633A' },
                          { skill: 'Grammar', level: 45, color: '#A6531C' },
                          { skill: 'Listening', level: 30, color: '#D4BC8C' },
                          { skill: 'Speaking', level: 20, color: '#483C32' },
                          { skill: 'Reading', level: 50, color: '#FFA502' },
                        ].map((skill) => (
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
                                backgroundColor: 'action.hover',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 4,
                                  backgroundColor: skill.color,
                                },
                              }}
                            />
                          </Box>
                        ))}
                      </Stack>
                    </Grid> */}
      </Grid>
    </motion.div>
  );
};
