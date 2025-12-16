import {
  EmojiEvents,
  School,
  TrendingUp,
  CalendarMonth,
  BookOnline,
  Grade,
  Forum,
  VideoCall,
} from "@mui/icons-material";
import { PublicProfile } from "../types/public-profile.types";

export const getMainStats = (profile: PublicProfile) => [
  {
    label: "Total Points",
    value: profile.totalPoints.toLocaleString(),
    icon: <EmojiEvents sx={{ color: "#FFD700" }} />,
    color: "#FFD700",
    description: "Points earned",
  },
  {
    label: "Current Level",
    value: profile.level,
    icon: <TrendingUp sx={{ color: "#5C633A" }} />,
    color: "#5C633A",
    description: "Learning level",
  },
  {
    label: "Lessons Completed",
    value: profile.totalLessonsCompleted,
    icon: <School sx={{ color: "#A6531C" }} />,
    color: "#A6531C",
    description: `Out of ${profile.totalLessonsAvailable}`,
  },
  {
    label: "Days Learning",
    value: profile.joinedDaysAgo,
    icon: <CalendarMonth sx={{ color: "#D4BC8C" }} />,
    color: "#D4BC8C",
    description: "Since joining",
  },
];

export const getAdditionalStats = (profile: PublicProfile) => [
  {
    label: "Courses Enrolled",
    value: profile.enrolledCourses,
    icon: <BookOnline sx={{ color: "#9B59B6" }} />,
    color: "#9B59B6",
  },
  {
    label: "Courses Completed",
    value: profile.completedCourses,
    icon: <Grade sx={{ color: "#E67E22" }} />,
    color: "#E67E22",
  },
  {
    label: "Community Posts",
    value: profile.communityPosts,
    icon: <Forum sx={{ color: "#3498DB" }} />,
    color: "#3498DB",
  },
  {
    label: "Sessions Attended",
    value: profile.sessionsAttended,
    icon: <VideoCall sx={{ color: "#E74C3C" }} />,
    color: "#E74C3C",
  },
];
