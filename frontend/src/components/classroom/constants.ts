export const gradientColors = {
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

export const getCourseColors = (courseType: string) => {
  return (
    gradientColors[courseType as keyof typeof gradientColors] ||
    gradientColors.JAPAN_IN_CONTEXT
  );
};