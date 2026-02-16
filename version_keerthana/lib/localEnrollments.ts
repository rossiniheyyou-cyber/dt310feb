/**
 * Local enrollment fallback - when course doesn't exist in backend yet,
 * we allow learners to enroll locally so they can access course content.
 */

const STORAGE_KEY = "digitalt3-local-enrollments";

function getStorageKey(): string {
  if (typeof window === "undefined") return STORAGE_KEY;
  try {
    const user = JSON.parse(localStorage.getItem("digitalt3-current-user") || "{}");
    const email = user?.email ? String(user.email).trim().toLowerCase() : "";
    return email ? `${STORAGE_KEY}:${email}` : STORAGE_KEY;
  } catch {
    return STORAGE_KEY;
  }
}

export function getLocalEnrolledCourseIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(getStorageKey());
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function addLocalEnrollment(courseId: string): void {
  if (typeof window === "undefined") return;
  try {
    const set = getLocalEnrolledCourseIds();
    set.add(String(courseId));
    localStorage.setItem(getStorageKey(), JSON.stringify([...set]));
  } catch {
    // ignore
  }
}

export function isLocallyEnrolled(courseId: string): boolean {
  return getLocalEnrolledCourseIds().has(String(courseId));
}
