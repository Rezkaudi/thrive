import { useEffect, useRef, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { PasswordStrength } from "../types/registration.types";
import { RegistrationFormInputs, registrationSchema } from "../validation/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { calculatePasswordStrength } from "../utils/passwordStrength";
import api from "../services/api";
import { useForm } from "react-hook-form";
import { setStoredPlan, isValidPlanType, clearStoredPlan, getStoredPlan } from "../utils/planStorage";

export const useRegistration = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // --- STRICT PLAN SYNC LOGIC ---

  // 1. Derived State (Source of Truth)
  const effectivePlan = useMemo(() => {
    const urlPlan = searchParams.get("plan");

    // Case A: User specifically requested a plan in URL
    if (urlPlan !== null) {
      if (isValidPlanType(urlPlan)) {
        return urlPlan; // URL is valid -> Use it
      }
      // URL is invalid (e.g. ?plan=sta) -> Treat as Default (Free Trial)
      // CRITICAL FIX: Do NOT fallback to getStoredPlan() here. 
      // The URL overrides the session.
      return null; 
    }

    // Case B: No plan in URL -> Check if we have a saved one from before
    return getStoredPlan();
  }, [searchParams]);

  // 2. Storage Synchronization (Side Effect)
  useEffect(() => {
    const urlPlan = searchParams.get("plan");

    if (urlPlan !== null) {
      if (isValidPlanType(urlPlan)) {
        // Valid plan in URL -> Save to storage
        setStoredPlan(urlPlan);
      } else {
        // Invalid plan in URL -> Explicitly CLEAR storage to match UI
        clearStoredPlan();
      }
    }
    // If urlPlan is null (missing), we change nothing in storage 
    // to allow persistence across refreshes.
  }, [searchParams]);

  // --- END PLAN LOGIC ---

  // Password Logic State
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    color: "error",
  });

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
      marketingEmails: false,
    },
  });

  const passwordValue = watch("password");

  useEffect(() => {
    if (passwordValue) {
      setPasswordStrength(calculatePasswordStrength(passwordValue));
    } else {
      setPasswordStrength({ score: 0, feedback: [], color: "error" });
    }
  }, [passwordValue]);

  const onSubmit = async (data: RegistrationFormInputs) => {
    setServerError("");

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
        marketingEmails: data.marketingEmails || false,
      });

      sessionStorage.setItem("registration_email", data.email);
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

  const isProceeding = useRef(false);

  useEffect(() => {
    if (serverError) {
      isProceeding.current = false;
    }
  }, [serverError]);

  useEffect(() => {
    return () => {
      if (!isProceeding.current) {
        clearStoredPlan();
      }
    };
  }, []);

  const onValidSubmit = async (data: any) => {
    isProceeding.current = true;
    await onSubmit(data);
  };

  return {
    register,
    handleSubmit,
    setShowPassword,
    setShowConfirmPassword,
    onValidSubmit,
    setServerError,
    errors,
    isValid,
    showPassword,
    showConfirmPassword,
    loading,
    serverError,
    passwordStrength,
    passwordValue,
    effectivePlan,
  };
};