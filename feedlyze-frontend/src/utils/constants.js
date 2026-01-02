// src/utils/constants.js

// Sentiment colors and labels
export const SENTIMENT = {
  POSITIVE: {
    label: 'Positive',
    color: 'success',
    bgClass: 'bg-success-50',
    textClass: 'text-success-600',
    borderClass: 'border-success-500',
  },
  NEUTRAL: {
    label: 'Neutral',
    color: 'warning',
    bgClass: 'bg-warning-50',
    textClass: 'text-warning-600',
    borderClass: 'border-warning-500',
  },
  NEGATIVE: {
    label: 'Negative',
    color: 'danger',
    bgClass: 'bg-danger-50',
    textClass: 'text-danger-600',
    borderClass: 'border-danger-500',
  },
};

// Question types
export const QUESTION_TYPES = {
  TEXT: 'text',
  RATING: 'rating',
  MULTIPLE_CHOICE: 'multiple_choice',
  YES_NO: 'yes_no',
  SCALE: 'scale',
};

// Question type labels
export const QUESTION_TYPE_LABELS = {
  [QUESTION_TYPES.TEXT]: 'Text Answer',
  [QUESTION_TYPES.RATING]: 'Star Rating',
  [QUESTION_TYPES.MULTIPLE_CHOICE]: 'Multiple Choice',
  [QUESTION_TYPES.YES_NO]: 'Yes/No',
  [QUESTION_TYPES.SCALE]: 'Scale (1-10)',
};

// Industries list
export const INDUSTRIES = [
  'Restaurant & Food Service',
  'Retail & Shopping',
  'Healthcare',
  'Hospitality & Hotels',
  'Education',
  'Financial Services',
  'Technology',
  'Entertainment',
  'Fitness & Wellness',
  'Automotive',
  'Real Estate',
  'Professional Services',
  'Other',
];

// Device types
export const DEVICE_TYPES = {
  MOBILE: 'mobile',
  TABLET: 'tablet',
  DESKTOP: 'desktop',
  UNKNOWN: 'unknown',
};

// Date range options
export const DATE_RANGES = [
  { value: '7', label: 'Last 7 Days' },
  { value: '30', label: 'Last 30 Days' },
  { value: '90', label: 'Last 90 Days' },
  { value: 'all', label: 'All Time' },
];

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
  },
  SURVEYS: {
    BASE: '/surveys',
    CREATE: '/surveys/create',
    PUBLIC: '/surveys/public',
  },
  RESPONSES: {
    BASE: '/responses',
    SUBMIT: '/responses/submit',
  },
  ANALYSIS: {
    BASE: '/analysis',
  },
  INSIGHTS: {
    BASE: '/insights',
    OVERVIEW: '/insights/overview',
    THEMES: '/insights/themes',
  },
  CHATBOT: {
    GENERATE: '/chatbot/generate-survey',
    REFINE: '/chatbot/refine-survey',
  },
};
