import {
  VideoLibrary,
  PictureAsPdf,
  School,
  Translate,
  Quiz as QuizIcon,
  Slideshow,
} from "@mui/icons-material";
import { COURSE_THEMES, Lesson } from "../types/course-details.types";
import { Course } from "../types/course.types";

export const getCourseColors = (courseType: string) => {
  return (
    COURSE_THEMES[courseType as keyof typeof COURSE_THEMES] ||
    COURSE_THEMES.JAPAN_IN_CONTEXT
  );
};

export const getLessonIcon = (
  lessonType: string,
  size: "small" | "medium" = "medium"
) => {
  const props = { sx: { fontSize: size === "small" ? 18 : 24 } };
  switch (lessonType) {
    case "VIDEO":
      return <VideoLibrary {...props} />;
    case "PDF":
      return <PictureAsPdf {...props} />;
    case "QUIZ":
      return <QuizIcon {...props} />;
    case "SLIDES":
      return <Slideshow {...props} />;
    case "KEYWORDS":
      return <Translate {...props} />;
    default:
      return <School {...props} />;
  }
};

export const calculateLessonLocks = (
  lessons: Lesson[],
  course: Course | null,
  hasSubscription: boolean
): Lesson[] => {
  if (!lessons.length || !course) return lessons;

  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);
  const freeLimit = course.freeLessonCount || 0;

  return sortedLessons.map((lesson, index) => {
    let isLocked = false;
    let lockReason = "";

    // Logic: If previous lesson incomplete, lock current.
    const previousIncomplete =
      index > 0 && !sortedLessons[index - 1].isCompleted;

    if (hasSubscription) {
      if (previousIncomplete) {
        isLocked = true;
        lockReason = "Complete previous lesson to unlock";
      }
    } else {
      // Free user logic
      if (index >= freeLimit) {
        isLocked = true;
        lockReason = "Subscribe to unlock";
      } else if (previousIncomplete) {
        isLocked = true;
        lockReason = "Complete previous lesson to unlock";
      }
    }

    return { ...lesson, isLocked, lockReason };
  });
};
