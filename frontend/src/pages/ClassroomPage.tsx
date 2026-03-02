import React, { useState, useEffect } from "react";
import {
  Container,
  useMediaQuery,
  useTheme,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  Button,
  Skeleton,
  Alert,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Course, CourseProgress } from "../types/course.types";
import { ClassroomService } from "../services/classroom.service";
import { levelService, Level } from "../services/levelService";
import { ClassroomHeader } from "../components/classroom/ClassroomHeader";
import { CourseGrid } from "../components/classroom/CourseGrid";
import { EnrollmentDialog } from "../components/classroom/EnrollmentDialog";
import api from "../services/api";

export const ClassroomPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { levelId } = useParams<{ levelId?: string }>();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [levels, setLevels] = useState<Level[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<string[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [enrollDialog, setEnrollDialog] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (levelId) {
      fetchCoursesForLevel(levelId);
    } else {
      fetchLevels();
    }
  }, [levelId]);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const data = await levelService.getAllLevels();
      setLevels(data);
    } catch (err) {
      setError("Failed to load levels");
    } finally {
      setLoading(false);
    }
  };

  const fetchCoursesForLevel = async (lid: string) => {
    try {
      setLoading(true);
      const [coursesRes, enrollmentsData] = await Promise.all([
        api.get(`/courses?levelId=${lid}`),
        ClassroomService.getEnrollments(),
      ]);

      setCourses(coursesRes.data);
      setEnrollments(enrollmentsData.map((e: any) => e.courseId));

      const progressPromises = enrollmentsData.map((e: any) =>
        ClassroomService.getCourseProgress(e.courseId)
      );
      const progressData = await Promise.all(progressPromises);
      setCourseProgress(progressData);
    } catch (err) {
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (course: Course) => {
    if (enrollments.includes(course.id)) {
      navigate(`/classroom/${levelId}/${course.id}`);
    } else {
      setEnrollDialog(course);
    }
  };

  const handleEnroll = async (course: Course) => {
    try {
      await ClassroomService.enrollInCourse(course.id);
      navigate(`/classroom/${levelId}/${course.id}`);
    } catch (error) {
      if ((error as any).response?.status === 409) {
        navigate(`/classroom/${levelId}/${course.id}`);
      }
    }
  };

  // Levels view (no levelId param)
  if (!levelId) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <ClassroomHeader />

        {loading && (
          <Grid container spacing={3}>
            {[1, 2, 3].map((i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Card sx={{ height: 180, borderRadius: 4 }}>
                  <Skeleton variant="rectangular" height={180} />
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <Grid container spacing={3}>
            {levels.map((level, index) => {
              const gradients = [
                "linear-gradient(135deg, #5C633A 0%, #8a9450 50%, #D4BC8C 100%)",
                "linear-gradient(135deg, #1a3a5c 0%, #2d6a9f 50%, #5ba3d9 100%)",
                "linear-gradient(135deg, #6b2d6b 0%, #a0449f 50%, #d67fd6 100%)",
                "linear-gradient(135deg, #7a2d00 0%, #c04a00 50%, #e8843a 100%)",
                "linear-gradient(135deg, #1a5c3a 0%, #2d9f6a 50%, #5bd9a3 100%)",
                "linear-gradient(135deg, #3a1a5c 0%, #6a2d9f 50%, #a35bd9 100%)",
              ];
              const gradient = gradients[index % gradients.length];

              return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={level.id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  style={{ height: "100%" }}
                >
                  <Card
                    sx={{
                      borderRadius: 2,
                      overflow: "hidden",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      border: "1px solid",
                      borderColor: "divider",
                      transition: "transform 0.25s ease, box-shadow 0.25s ease",
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: "0 16px 40px rgba(0,0,0,0.18)",
                      },
                    }}
                  >
                    <CardActionArea
                      onClick={() => navigate(`/classroom/${level.id}`)}
                      sx={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "stretch" }}
                    >
                      {/* Gradient banner */}
                      <Box
                        sx={{
                          height: 130,
                          background: gradient,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        {/* Decorative circles */}
                        <Box sx={{
                          position: "absolute", top: -20, right: -20,
                          width: 100, height: 100, borderRadius: "50%",
                          background: "rgba(255,255,255,0.08)",
                        }} />
                        <Box sx={{
                          position: "absolute", bottom: -30, left: -10,
                          width: 130, height: 130, borderRadius: "50%",
                          background: "rgba(255,255,255,0.06)",
                        }} />
                        {/* Level avatar */}
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.2)",
                            backdropFilter: "blur(4px)",
                            border: "2px solid rgba(255,255,255,0.4)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 1,
                          }}
                        >
                          <Typography variant="h4" sx={{ color: "white", fontWeight: 800, lineHeight: 1 }}>
                            {level.name.charAt(0).toUpperCase()}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Text content */}
                      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                        <Typography variant="h6" fontWeight={700} gutterBottom sx={{ lineHeight: 1.3 }}>
                          {level.name}
                        </Typography>
                        {level.description ? (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {level.description}
                          </Typography>
                        ) : (
                          null
                        )}
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </motion.div>
              </Grid>
              );
            })}
            {levels.length === 0 && !loading && (
              <Grid size={{ xs: 12 }}>
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <Typography variant="h6" color="text.secondary">
                    No levels available yet.
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        )}
      </Container>
    );
  }

  // Courses view (with levelId param)
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/classroom")}
        sx={{ mb: 3 }}
      >
        Back to Levels
      </Button>

      <CourseGrid
        courses={courses}
        loading={loading}
        error={error}
        enrollments={enrollments}
        progressData={courseProgress}
        onCourseClick={handleCourseClick}
        isMobile={isMobile}
      />

      <EnrollmentDialog
        course={enrollDialog}
        onClose={() => setEnrollDialog(null)}
        onEnroll={handleEnroll}
      />
    </Container>
  );
};
