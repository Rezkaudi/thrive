export const COURSE_THEMES = {
  JAPAN_IN_CONTEXT: {
    primary: "#5C633A",
    secondary: "#D4BC8C",
    accent: "#D4BC8C",
  },
  JLPT_IN_CONTEXT: {
    primary: "#A6531C",
    secondary: "#7ED4D0",
    accent: "#6DD6CE",
  },
} as const;

export const getCourseTheme = (courseType: string) => {
  return (
    COURSE_THEMES[courseType as keyof typeof COURSE_THEMES] ||
    COURSE_THEMES.JAPAN_IN_CONTEXT
  );
};

export const createCourseGradient = (theme: { primary: string; secondary: string }) => {
  return `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`;
};