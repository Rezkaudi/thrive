/**
 * Valid plan types that can be stored in sessionStorage.
 * Update this array when new plans are added.
 */
export const VALID_PLAN_TYPES = ['standard', 'premium'] as const;

export type PlanType = (typeof VALID_PLAN_TYPES)[number];

const PLAN_STORAGE_KEY = 'selectedPlan';

/**
 * Type guard to validate if a value is a valid plan type.
 */
export const isValidPlanType = (value: unknown): value is PlanType => {
  return typeof value === 'string' && VALID_PLAN_TYPES.includes(value as PlanType);
};

/**
 * Safely retrieves and validates the stored plan from sessionStorage.
 * Returns null if no plan exists, plan is invalid, or sessionStorage is unavailable.
 */
export const getStoredPlan = (): PlanType | null => {
  try {
    const storedPlan = sessionStorage.getItem(PLAN_STORAGE_KEY);

    if (!storedPlan) {
      return null;
    }

    if (isValidPlanType(storedPlan)) {
      return storedPlan;
    }

    // Invalid plan found - clean up corrupted data
    console.warn(`Invalid plan type found in sessionStorage: "${storedPlan}". Removing.`);
    sessionStorage.removeItem(PLAN_STORAGE_KEY);
    return null;
  } catch (error) {
    // sessionStorage might be unavailable (e.g., private browsing, storage quota exceeded)
    console.error('Failed to access sessionStorage:', error);
    return null;
  }
};

/**
 * Stores a valid plan type in sessionStorage.
 * Returns true if successful, false otherwise.
 */
export const setStoredPlan = (plan: PlanType): boolean => {
  try {
    if (!isValidPlanType(plan)) {
      console.error(`Attempted to store invalid plan type: "${plan}"`);
      return false;
    }

    sessionStorage.setItem(PLAN_STORAGE_KEY, plan);
    return true;
  } catch (error) {
    console.error('Failed to store plan in sessionStorage:', error);
    return false;
  }
};

/**
 * Removes the stored plan from sessionStorage.
 */
export const clearStoredPlan = (): void => {
  try {
    sessionStorage.removeItem(PLAN_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear plan from sessionStorage:', error);
  }
};

/**
 * Checks if a valid plan is already stored in sessionStorage.
 */
export const hasStoredPlan = (): boolean => {
  return getStoredPlan() !== null;
};
