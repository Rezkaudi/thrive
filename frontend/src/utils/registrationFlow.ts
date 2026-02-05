// frontend/src/utils/registrationFlow.ts
import { getStoredPlan, PlanType } from './planStorage';

/**
 * Registration flow types
 */
export type RegistrationFlowType = 'free_trial' | 'paid';

/**
 * Step configuration for each step in the registration flow
 */
export interface RegistrationStep {
  id: string;
  label: string;
  path: string;
}

/**
 * Flow configuration containing all steps and metadata
 */
export interface RegistrationFlowConfig {
  flowType: RegistrationFlowType;
  totalSteps: number;
  steps: RegistrationStep[];
  selectedPlan: PlanType | null;
}

/**
 * Step definitions for Free Trial flow (2 steps)
 * 1. Basic Info (Name, Email, Password)
 * 2. Verify Email -> Redirect to Dashboard
 */
const FREE_TRIAL_STEPS: RegistrationStep[] = [
  {
    id: 'basic_info',
    label: 'Account Information',
    path: '/register',
  },
  {
    id: 'verify_email',
    label: 'Email Verification',
    path: '/register/verify',
  },
];

/**
 * Step definitions for Paid flow (3 steps)
 * 1. Basic Info (Name, Email, Password)
 * 2. Verify Email
 * 3. Checkout & Pay -> Redirect to Success Page
 */
const PAID_FLOW_STEPS: RegistrationStep[] = [
  {
    id: 'basic_info',
    label: 'Account Information',
    path: '/register',
  },
  {
    id: 'verify_email',
    label: 'Email Verification',
    path: '/register/verify',
  },
  {
    id: 'checkout',
    label: 'Complete Payment',
    path: '/subscription',
  },
];

/**
 * Determines the registration flow type based on sessionStorage
 * @returns The flow type: 'paid' if plan exists, 'free_trial' otherwise
 */
export const getRegistrationFlowType = (): RegistrationFlowType => {
  const storedPlan = getStoredPlan();
  return storedPlan ? 'paid' : 'free_trial';
};

/**
 * Gets the complete registration flow configuration
 * This is the main function to use for dynamic step calculation
 * 
 * @returns RegistrationFlowConfig with all flow details
 */
export const getRegistrationFlowConfig = (): RegistrationFlowConfig => {
  const storedPlan = getStoredPlan();
  const flowType = storedPlan ? 'paid' : 'free_trial';
  const steps = flowType === 'paid' ? PAID_FLOW_STEPS : FREE_TRIAL_STEPS;

  return {
    flowType,
    totalSteps: steps.length,
    steps,
    selectedPlan: storedPlan,
  };
};

/**
 * Gets the current step number based on step ID
 * @param stepId - The ID of the current step
 * @returns The step number (1-indexed) or 1 if not found
 */
export const getStepNumber = (stepId: string): number => {
  const config = getRegistrationFlowConfig();
  const index = config.steps.findIndex(step => step.id === stepId);
  return index >= 0 ? index + 1 : 1;
};

/**
 * Gets step configuration by step ID
 * @param stepId - The ID of the step
 * @returns The step configuration or undefined if not found
 */
export const getStepConfig = (stepId: string): RegistrationStep | undefined => {
  const config = getRegistrationFlowConfig();
  return config.steps.find(step => step.id === stepId);
};

/**
 * Determines the redirect URL after email verification
 * - Free Trial: Redirect to Dashboard
 * - Paid Flow: Redirect to Subscription/Checkout
 * 
 * @returns The URL to redirect to after verification
 */
export const getPostVerificationRedirect = (): string => {
  const config = getRegistrationFlowConfig();

  if (config.flowType === 'paid' && config.selectedPlan) {
    return `/subscription?plan=${config.selectedPlan}`;
  }

  return '/dashboard';
};

/**
 * Hook-friendly helper to get all registration flow data
 * Use this in components that need to display step indicators
 */
export const useRegistrationFlowData = (currentStepId: string) => {
  const config = getRegistrationFlowConfig();
  const currentStepNumber = getStepNumber(currentStepId);
  const currentStep = getStepConfig(currentStepId);

  return {
    ...config,
    currentStepNumber,
    currentStepLabel: currentStep?.label || '',
    isLastStep: currentStepNumber === config.totalSteps,
    isPaidFlow: config.flowType === 'paid',
    isFreeTrial: config.flowType === 'free_trial',
  };
};
