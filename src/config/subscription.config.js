/**
 * Subscription Plans Configuration
 * Central source of truth for all plan-related data
 */

export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'FREE',
    price: 0,
    priceFormatted: '₹0',
    jobLimit: 3,
    features: [
      'Up to 3 job postings',
      'Basic analytics',
      'Email support'
    ]
  },
  PROFESSIONAL: {
    name: 'PROFESSIONAL',
    price: 999,
    priceFormatted: '₹999',
    jobLimit: 20,
    features: [
      'Up to 20 job postings',
      'Advanced analytics',
      'Priority support',
      'Featured jobs'
    ]
  },
  ENTERPRISE: {
    name: 'ENTERPRISE',
    price: 2999,
    priceFormatted: '₹2,999',
    jobLimit: Infinity,
    features: [
      'Unlimited job postings',
      'Full analytics suite',
      'Dedicated support',
      'API access',
      'Custom branding'
    ]
  }
};

export const getPlanByName = (planName) => {
  return SUBSCRIPTION_PLANS[planName?.toUpperCase()] || SUBSCRIPTION_PLANS.FREE;
};

export const getJobLimit = (planName) => {
  return getPlanByName(planName).jobLimit;
};

export const formatJobLimit = (planName) => {
  const limit = getJobLimit(planName);
  return limit === Infinity ? '∞' : limit.toString();
};

export const getPlanPrice = (planName) => {
  return getPlanByName(planName).price;
};

export const formatPlanPrice = (planName) => {
  return getPlanByName(planName).priceFormatted;
};

export const getPlanFeatures = (planName) => {
  return getPlanByName(planName).features;
};

export const PLAN_ORDER = ['FREE', 'PROFESSIONAL', 'ENTERPRISE'];

export const canUpgradeTo = (currentPlan, targetPlan) => {
  const currentIndex = PLAN_ORDER.indexOf(currentPlan?.toUpperCase());
  const targetIndex = PLAN_ORDER.indexOf(targetPlan?.toUpperCase());
  return targetIndex > currentIndex;
};
