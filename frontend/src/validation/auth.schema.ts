import { z } from 'zod';

export const registrationSchema = z
  .object({
    name: z.string().min(1, "Please enter your name"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    // FIXED: Use z.boolean() + refine instead of z.literal()
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegistrationFormInputs = z.infer<typeof registrationSchema>;