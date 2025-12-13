import React from "react";
import { Alert, Button, Paper, Stack } from "@mui/material";
import { EmojiEvents, CheckCircle } from "@mui/icons-material";
import { KeywordFlashcards } from "../classroom/KeywordFlashcards";
import { Quiz } from "../classroom/Quiz";
import { InteractiveSlides } from "../classroom/InteractiveSlides";
import { SimplePDFViewer } from "../classroom/SimplePDFViewer";
import { Lesson } from "./types";
import { VideoPlayer } from "./VideoPlayer";

interface Props {
  selectedLesson: Lesson;
  onCompleteLesson: (quizScore?: number) => void;
  selectedCourseColors: { primary: string; secondary: string };
}

export const LessonContentRenderer: React.FC<Props> = ({
  selectedLesson,
  onCompleteLesson,
  selectedCourseColors,
}) => {
  if (selectedLesson.lessonType === "KEYWORDS") {
    return selectedLesson.keywords && selectedLesson.keywords.length > 0 ? (
      <KeywordFlashcards
        keywords={selectedLesson.keywords}
        pointsReward={selectedLesson.pointsReward}
        onComplete={() => onCompleteLesson()}
        isLessonCompleted={!!selectedLesson.isCompleted}
      />
    ) : (
      <Alert severity="warning" sx={{ mb: 4, borderRadius: 3 }}>
        No keywords available for this lesson. Please contact support.
      </Alert>
    );
  }

  if (selectedLesson.lessonType === "QUIZ") {
    return selectedLesson.contentData?.questions ? (
      <Quiz
        questions={selectedLesson.contentData.questions}
        passingScore={selectedLesson.passingScore || 70}
        timeLimit={selectedLesson.contentData.timeLimit}
        pointsReward={selectedLesson.pointsReward}
        onComplete={(score, passed) => {
          if (passed) onCompleteLesson(score);
        }}
        isLessonCompleted={!!selectedLesson.isCompleted}
      />
    ) : (
      <Alert severity="warning" sx={{ mb: 4, borderRadius: 3 }}>
        No quiz data available for this lesson. Please contact support.
      </Alert>
    );
  }

  if (selectedLesson.lessonType === "SLIDES") {
    return selectedLesson.contentData?.slides ? (
      <InteractiveSlides
        slides={selectedLesson.contentData.slides}
        pointsReward={selectedLesson.pointsReward}
        onComplete={() => onCompleteLesson()}
        isLessonCompleted={!!selectedLesson.isCompleted}
      />
    ) : (
      <Alert severity="warning" sx={{ mb: 4, borderRadius: 3 }}>
        No slides data available for this lesson. Please contact support.
      </Alert>
    );
  }

  if (
    selectedLesson.lessonType === "VIDEO" ||
    selectedLesson.lessonType === "PDF"
  ) {
    return (
      <>
        {selectedLesson.contentUrl ? (
          selectedLesson.lessonType === "VIDEO" ? (
            <VideoPlayer url={selectedLesson.contentUrl} />
          ) : selectedLesson.contentUrl ? (
            <SimplePDFViewer
              url={selectedLesson.contentUrl}
              title={selectedLesson.title}
              allowDownload={true}
            />
          ) : (
            <Alert severity="warning" sx={{ mb: 4, borderRadius: 3 }}>
              Content URL not available. Please contact support.
            </Alert>
          )
        ) : (
          <Alert severity="warning" sx={{ mb: 4, borderRadius: 3 }}>
            Content URL not available. Please contact support.
          </Alert>
        )}

        <Paper
          elevation={0}
          sx={{
            p: 3,
            mt: 4,
            borderRadius: 3,
            bgcolor: "background.default",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            justifyContent="flex-end"
            alignItems="center"
          >
            <Button
              variant="contained"
              size="large"
              disabled={selectedLesson.isCompleted}
              onClick={() => onCompleteLesson()}
              startIcon={
                selectedLesson.isCompleted ? <CheckCircle /> : <EmojiEvents />
              }
              sx={{
                borderRadius: 2,
                px: 4,
                background: selectedLesson.isCompleted
                  ? "linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)"
                  : `linear-gradient(135deg, ${selectedCourseColors.primary} 0%, ${selectedCourseColors.secondary} 100%)`,
              }}
            >
              {selectedLesson.isCompleted
                ? "Lesson Completed"
                : "Mark as Complete"}
            </Button>
          </Stack>
        </Paper>

        {selectedLesson.requiresReflection && !selectedLesson.isCompleted && (
          <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
            💭 This lesson requires a reflection. You'll be prompted to write
            one after marking it complete.
          </Alert>
        )}
      </>
    );
  }

  return null;
};
