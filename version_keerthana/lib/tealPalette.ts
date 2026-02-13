/**
 * Teal color palette - 5 shades from light to dark.
 * Use with white and black throughout the application.
 * For score rings, daily streak bars, and colorful elements.
 */
export const TEAL_PALETTE = {
  /** Lightest - pale mint/aqua */
  teal100: "#ccfbf1",
  /** Light teal */
  teal200: "#99f6e4",
  /** Vibrant medium teal */
  teal400: "#2dd4bf",
  /** Darker teal */
  teal600: "#0d9488",
  /** Darkest teal */
  teal900: "#134e4a",
} as const;

/** Array for cycling through skills/segments (light to dark) */
export const TEAL_GRADIENT = [
  "#ccfbf1",
  "#99f6e4",
  "#2dd4bf",
  "#0d9488",
  "#134e4a",
];

/**
 * Shared palette for dashboard charts (Readiness, Daily Streak, Skills Distribution).
 * Distinct dark pink, gold, and teal shades - each color easily differentiable.
 */
export const DASHBOARD_CHART_PALETTE = [
  "#ec4899", // dark pink
  "#f59e0b", // amber/gold
  "#14b8a6", // teal
  "#be185d", // deeper pink
  "#d97706", // darker gold
  "#0d9488", // darker teal
  "#db2777", // medium pink
  "#fbbf24", // light gold
  "#2dd4bf", // light teal
] as const;
