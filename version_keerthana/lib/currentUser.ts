/**
 * Current logged-in user (frontend only, localStorage).
 * Set on login; used by dashboard welcome and settings.
 */

const STORAGE_KEY = "digitalt3-current-user";

export const PROFESSIONAL_TITLES = [
  "Associate Fullstack Developer",
  "Fullstack Developer",
  "Senior Fullstack Developer",
] as const;
export type ProfessionalTitle = (typeof PROFESSIONAL_TITLES)[number];

export type CurrentUser = {
  name: string;
  email: string;
  role?: "admin" | "instructor" | "learner" | "manager";
  professionalTitle?: ProfessionalTitle | string;
};

function normalizeRole(role: unknown): CurrentUser["role"] | undefined {
  if (typeof role !== "string") return undefined;
  const normalized = role.trim().toLowerCase();
  if (
    normalized === "admin" ||
    normalized === "instructor" ||
    normalized === "learner" ||
    normalized === "manager"
  ) {
    return normalized;
  }
  return undefined;
}

export function getCurrentUser(): CurrentUser | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as CurrentUser;
      return {
        ...parsed,
        role: normalizeRole(parsed.role),
      };
    }
  } catch (_) {}
  return null;
}

export function setCurrentUser(user: CurrentUser): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getCurrentUser();
    const merged: CurrentUser = {
      ...(existing ?? {}),
      ...user,
      role: normalizeRole(user.role) ?? existing?.role,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch (_) {}
}

export function clearCurrentUser(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (_) {}
}

/** Derive display name from email when no name is stored (e.g. admin@digitalt3.com → Admin). */
export function getNameFromEmail(email: string): string {
  const part = email.split("@")[0];
  if (!part) return "Learner";
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
}
