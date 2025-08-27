import {
  Alert,
  Box,
  Typography,
  Stack,
  Paper,
  Button,
  Fade,
} from "@mui/material";
import { RadioGroup, FormControlLabel, Radio } from "@mui/material";
import { SlideComponentProps } from "../../types/slide.types";
import { useState } from "react";
import { VolumeUp } from "@mui/icons-material";

export const ListeningSlide: React.FC<SlideComponentProps> = ({
  slide,
  interactiveAnswers,
  setInteractiveAnswers,
  showFeedback,
  validationResults,
  checkAnswer,
}) => {
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null
  );
  const content = slide.content.content;
  const slideId = `listening-${slide.id}`;
  const userAnswer = interactiveAnswers[slideId];
  const showSlideFeeback = showFeedback[slideId];
  const validation = validationResults[slideId];

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setInteractiveAnswers((prev) => ({
      ...prev,
      [slideId]: {
        ...prev[slideId],
        [questionIndex]: answerIndex,
      },
    }));
  };

  const handleCheckAnswer = () => {
    const correctAnswers: Record<number, number> = {};
    content.items?.forEach((item: any, index: number) => {
      correctAnswers[index] = item.correct;
    });

    checkAnswer(slideId, userAnswer || {}, correctAnswers, "listening");
  };

  const playAudio = (url: string) => {
    if (currentAudio) {
      currentAudio.pause();
    }
    const audio = new Audio(url);
    setCurrentAudio(audio);
    audio.play();
  };

  return (
    <Box sx={{ padding: { xs: 1, lg: 4 }, py: { xs: 1, lg: 4 }, borderRadius: { xs: "25px", lg: "47px" }, maxWidth: "800px", margin: "0 auto" }}>
      <Typography
        variant="h4"
        gutterBottom
        fontWeight={600}
        textAlign="center"
        sx={{ mb: 3 }}
      >
        {slide.content.title}
      </Typography>

      <Typography
        variant="h3"
        sx={{
          textAlign: "center",
          mb: 4,
          // color: "text.secondary",
          // fontSize: "1.1rem",
        }}
      >
        {content.instruction}
      </Typography>

      {showSlideFeeback && validation && (
        <Fade in>
          <Alert
            severity={validation.type}
            sx={{ mt: 3, borderRadius: 2, fontSize: "1rem" }}
          >
            {validation.message}
          </Alert>
        </Fade>
      )}

      <Stack spacing={4}>
        {content.items?.map((item: any, questionIndex: number) => (
          <Paper
            key={item.id}
            sx={{ p: { xs: 2, lg: 4 }, borderRadius: { xs: 2, lg: 3 }, bgcolor: "background.paper" }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 3 }}
            >
              <Typography variant="h6" fontWeight={600}>
                Question {questionIndex + 1}
              </Typography>
              <Button
                variant="contained"
                startIcon={<VolumeUp />}
                onClick={() => playAudio(item.audioUrl)}
                sx={{ borderRadius: 3, px: { xs: "12px", lg: "" }, py: { xs: "6px", lg: "" } }}
              >
                Play Audio
              </Button>
            </Stack>

            <Typography variant="body1" sx={{ mb: 3, fontSize: "1.1rem" }}>
              {item.question}
            </Typography>

            <RadioGroup
              value={userAnswer?.[questionIndex]?.toString() || ""}
              onChange={(e) =>
                handleAnswerSelect(questionIndex, parseInt(e.target.value))
              }
            >
              {item.options?.map((option: string, optionIndex: number) => (
                <FormControlLabel
                  key={optionIndex}
                  value={optionIndex.toString()}
                  control={<Radio />}
                  label={option}
                  sx={{
                    mb: 1,
                    mx: 1,
                    p: 1,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                />
              ))}
            </RadioGroup>
          </Paper>
        )) || []}
      </Stack>

      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleCheckAnswer}
          disabled={
            !userAnswer ||
            Object.keys(userAnswer).length !== (content.items?.length || 0)
          }
          sx={{
            px: { xs: 3, lg: 6 },
            py: { xs: 1, lg: 2 },
            fontSize: "1.1rem",
            borderRadius: 3,
            background: "linear-gradient(45deg, #8BC34A 30%, #CDDC39 90%)",
            "&:hover": {
              background: "linear-gradient(45deg, #689F38 30%, #9E9D24 90%)",
            },
          }}
        >
          Check Answers ({Object.keys(userAnswer || {}).length}/
          {content.items?.length || 0})
        </Button>
      </Box>


    </Box>
  );
};
