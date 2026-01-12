import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PasswordStrength } from "../types/registration.types";
import { RegistrationFormInputs, registrationSchema } from "../validation/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { calculatePasswordStrength } from "../utils/passwordStrength";
import api from "../services/api";
import { useForm } from "react-hook-form";

export const useRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // Password Logic State
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    color: "error",
  });

  // React Hook Form Setup
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<RegistrationFormInputs>({
    resolver: zodResolver(registrationSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });

  // Watch password field to update strength meter
  const passwordValue = watch("password");


  // Get params about plan type from URL and store in session storage
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const preSelectedPlan = params.get("plan");

    if (preSelectedPlan === "standard" || preSelectedPlan === "premium") {
      sessionStorage.setItem("selectedPlan", preSelectedPlan);
    }
  }, [location])

  useEffect(() => {
    if (passwordValue) {
      setPasswordStrength(calculatePasswordStrength(passwordValue));
    } else {
      setPasswordStrength({ score: 0, feedback: [], color: "error" });
    }
  }, [passwordValue]);

  // Form Submission Handler
  const onSubmit = async (data: RegistrationFormInputs) => {
    setServerError("");

    // Secondary check for password strength (optional, as visual meter warns user)
    if (passwordStrength.score < 100) {
      setServerError("Please create a stronger password before continuing.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register-new", {
        name: data.name,
        email: data.email,
        password: data.password,
        isVerifyEmail: false,
      });

      // Store email for next step
      sessionStorage.setItem("registration_email", data.email);

      // Navigate to verification page
      navigate("/register/verify");
    } catch (err: any) {
      setServerError(
        err.response?.data?.error?.message ||
        err.response?.data?.error ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    register,
    handleSubmit,
    setShowPassword,
    setShowConfirmPassword,
    onSubmit,
    setServerError,
    errors,
    isValid,
    showPassword,
    showConfirmPassword,
    loading,
    serverError,
    passwordStrength,
    passwordValue
  }
}