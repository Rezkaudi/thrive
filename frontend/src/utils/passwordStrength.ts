import { PasswordStrength } from "../types/registration.types";


export const calculatePasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  const feedback = [];

  if (password.length >= 8) score += 25;
  else feedback.push("At least 8 characters");

  if (/[A-Z]/.test(password)) score += 25;
  else feedback.push("One uppercase letter");

  if (/[a-z]/.test(password)) score += 25;
  else feedback.push("One lowercase letter");

  if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 25;
  else feedback.push("One number or special character");

  let color = "error";
  if (score >= 75) color = "success";
  else if (score >= 50) color = "warning";

  return { score, feedback, color: color as string };
};