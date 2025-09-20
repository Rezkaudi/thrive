import { Box, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";

interface IProgressProps {
  publicProfileData: any;
}

export const Progress = ({ publicProfileData }: IProgressProps) => {
  return (
    <motion.div
      key="progress"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <Stack spacing={4}>
        <Box>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Course Progress
          </Typography>
          <Stack spacing={3}>
            {publicProfileData?.courseProgress?.map((course: any) => (
              <Paper key={course.courseTitle} sx={{ p: 3 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {course.courseTitle}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {course.completedLessons}/{course.totalLessons} lessons
                      completed
                    </Typography>
                  </Box>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={course.progressPercentage}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: "action.hover",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 5,
                      backgroundColor: "#A6531C",
                    },
                  }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {course.progressPercentage}% Complete
                </Typography>
              </Paper>
            )) ||
              // Fallback if no real data
              [
                {
                  course: "Japan in Context",
                  progress: 40,
                  lessons: "4/10",
                  color: "#5C633A",
                },
                {
                  course: "JLPT N5 Preparation",
                  progress: 25,
                  lessons: "3/12",
                  color: "#A6531C",
                },
              ].map((course) => (
                <Paper key={course.course} sx={{ p: 3 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {course.course}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {course.lessons} lessons completed
                      </Typography>
                    </Box>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={course.progress}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: "action.hover",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 5,
                        backgroundColor: course.color,
                      },
                    }}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {course.progress}% Complete
                  </Typography>
                </Paper>
              ))}
          </Stack>
        </Box>

        {/* <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Weekly Study Time
                      </Typography>
                      <Paper sx={{ p: 3 }}>
                        <Grid container spacing={2}>
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                            <Grid size="auto" key={day}>
                              <Stack alignItems="center" spacing={1}>
                                <Box
                                  sx={{
                                    width: 40,
                                    height: 100,
                                    bgcolor: 'action.hover',
                                    borderRadius: 2,
                                    position: 'relative',
                                    overflow: 'hidden',
                                  }}
                                >
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      bottom: 0,
                                      left: 0,
                                      right: 0,
                                      height: `${Math.random() * 100}%`,
                                      bgcolor: 'primary.main',
                                      borderRadius: 2,
                                    }}
                                  />
                                </Box>
                                <Typography variant="caption">{day}</Typography>
                              </Stack>
                            </Grid>
                          ))}
                        </Grid>
                      </Paper>
                    </Box> */}
      </Stack>
    </motion.div>
  );
};
