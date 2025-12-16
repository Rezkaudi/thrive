import { Button, Card, CardContent, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface IActionsSectionProps {
  name: string;
}

interface IActionButton {
  label: string;
  href: string;
  variantValue: "contained" | "outlined";
}

const ActionButton = ({ href, label, variantValue }: IActionButton) => {
  const navigate = useNavigate();
  return (
    <Button
      variant={variantValue}
      size="large"
      onClick={() => navigate(href)}
      sx={{ mr: 2 }}
    >
      {label}
    </Button>
  );
};

export const ActionsSection = ({ name }: IActionsSectionProps) => {
  return (
    <Card sx={{ mt: 4, textAlign: "center" }}>
      <CardContent sx={{ py: 6 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Start Your Japanese Learning Journey
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Join thousands of learners like {name} and master Japanese with Thrive
          in Japan!
        </Typography>
        <ActionButton
          label="Get Started"
          href="/register"
          variantValue="contained"
        />
        <ActionButton label="Sign In" href="/login" variantValue="outlined" />
      </CardContent>
    </Card>
  );
};
