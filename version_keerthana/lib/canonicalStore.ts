/**
 * Single source of truth for Courses, Modules, Assignments, Quizzes.
 * Instructor creates/edits here; Learner consumes published data only.
 * Persists to localStorage so changes reflect across Instructor and Learner views.
 * Now syncs with backend API to ensure instructor-created courses appear for learners.
 */

import { getInitialCanonicalCourses, getCourseById as getCourseFromData } from "@/data/canonicalCourses";
import type { CanonicalCourse, CanonicalModule } from "@/data/canonicalCourses";
import { assignments as initialAssignments } from "@/data/assignments";
import type { Assignment } from "@/data/assignments";
import { quizConfigs as initialQuizConfigs } from "@/data/quizData";
import type { QuizConfig } from "@/data/quizData";
import { getCourses } from "./api/courses";

const STORAGE_KEY = "digitalt3-canonical-store";

export type CanonicalStoreState = {
  courses: CanonicalCourse[];
  assignments: Assignment[];
  quizConfigs: Record<string, QuizConfig>;
};

function loadInitial(): CanonicalStoreState {
  return {
    courses: getInitialCanonicalCourses(),
    assignments: [...initialAssignments],
    quizConfigs: { ...initialQuizConfigs },
  };
}

// Map course tags/roles to path slugs
function inferPathSlugFromTags(tags: string[]): string {
  // Map common role tags to path slugs
  const tagToPathMap: Record<string, string> = {
    "Full Stack Web Development": "fullstack",
    "UI / UX Designer": "uiux",
    "Data Analyst / Engineer": "data-analyst",
    "Cloud & DevOps Engineer": "cloud-devops",
    "QA Engineer": "qa",
    "Digital Marketing": "digital-marketing",
  };
  
  // Check if any tag matches a known path
  for (const tag of tags) {
    if (tagToPathMap[tag]) {
      return tagToPathMap[tag];
    }
  }
  
  // Default to fullstack if no match
  return "fullstack";
}

async function syncBackendCourses(): Promise<CanonicalCourse[]> {
  try {
    // Fetch all courses from backend (draft, pending_approval, published) so instructor sees their courses with correct IDs
    const response = await getCourses({ limit: 100 });
    
    const apiIdStr = (id: unknown) => (id != null ? String(id) : "");
    // Transform backend courses to canonical format
    return response.items.map((apiCourse) => {
      const backendIdStr = apiIdStr(apiCourse.id);
      // Match by canonical id or backendId so instructor-published course (id=frontendId, backendId=7) is updated when API returns id=7
      const existing = getCanonicalState().courses.find(
        (c) => c.id === apiCourse.id || (c.backendId != null && apiIdStr(c.backendId) === backendIdStr)
      );

      // If exists, preserve canonical id and fields; update status and basic info from backend
      if (existing) {
        return {
          ...existing,
          id: existing.id, // keep canonical id for stable URLs
          backendId: apiCourse.id,
          title: apiCourse.title,
          description: apiCourse.description,
          videoUrl: (apiCourse as { videoUrl?: string }).videoUrl ?? existing.videoUrl,
          status: apiCourse.status as "published" | "draft" | "archived" | "pending_approval" | "rejected",
          lastUpdated: apiCourse.updatedAt?.split("T")[0] || new Date().toISOString().split("T")[0],
        };
      }

      // New course from backend - create canonical format
      const inferredPathSlug = inferPathSlugFromTags(apiCourse.tags || []);
      const idStr = backendIdStr || String(apiCourse.id);

      return {
        id: idStr,
        backendId: apiCourse.id,
        title: apiCourse.title,
        description: apiCourse.description,
        videoUrl: (apiCourse as { videoUrl?: string }).videoUrl,
        thumbnail: undefined,
        estimatedDuration: "2 weeks",
        status: apiCourse.status as "published" | "draft" | "archived" | "pending_approval" | "rejected",
        roles: apiCourse.tags.length > 0 ? apiCourse.tags : ["General"],
        phase: "Foundation",
        courseOrder: 1,
        prerequisiteCourseIds: [],
        modules: [],
        instructor: {
          name: apiCourse.createdBy?.name || "Instructor",
          role: "Tech Lead",
        },
        skills: [],
        pathSlug: inferredPathSlug, // Infer from tags instead of defaulting
        lastUpdated: apiCourse.updatedAt?.split("T")[0] || new Date().toISOString().split("T")[0],
        enrolledCount: 0,
        completionRate: 0,
        createdAt: apiCourse.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0],
      };
    });
  } catch (error) {
    console.error("Failed to sync backend courses:", error);
    return [];
  }
}

function loadState(): CanonicalStoreState {
  if (typeof window === "undefined") return loadInitial();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const initial = loadInitial();
    if (stored) {
      const parsed = JSON.parse(stored) as CanonicalStoreState;
      const storedCourses = parsed.courses ?? initial.courses;
      const mergedCourses = storedCourses.map((c) => {
        const fromData = getCourseFromData(c.id);
        if (fromData?.modules?.length) {
          if (!c.modules || c.modules.length === 0) {
            return { ...c, ...fromData, backendId: c.backendId ?? fromData.backendId };
          }
          if (c.id === "html-css" || c.id === "javascript-fundamentals") {
            return { ...c, ...fromData, backendId: c.backendId ?? fromData.backendId };
          }
        }
        return c;
      });
      const storedIds = new Set(mergedCourses.map((c) => String(c.id)));
      const toAdd = initial.courses.filter((c) => !storedIds.has(String(c.id)) && c.modules?.length);
      const courses = [...mergedCourses, ...toAdd];
      return {
        courses,
        assignments: parsed.assignments ?? initial.assignments,
        quizConfigs: parsed.quizConfigs ?? initial.quizConfigs,
      };
    }
  } catch (_) {}
  return loadInitial();
}

function saveState(state: CanonicalStoreState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_) {}
}

let state = loadInitial();
let hydrated = false;
const listeners = new Set<() => void>();

let syncPromise: Promise<void> | null = null;

export function getCanonicalState(): CanonicalStoreState {
  if (typeof window !== "undefined" && !hydrated) {
    hydrated = true;
    state = loadState();
    
    // Sync with backend in the background (don't block)
    if (!syncPromise) {
      syncPromise = syncBackendCourses().then((backendCourses) => {
        if (backendCourses.length > 0) {
          // Merge backend courses with existing courses
          const existingIds = new Set(state.courses.map((c) => c.id));
          const newBackendCourses = backendCourses.filter((c) => !existingIds.has(c.id));
          
          if (newBackendCourses.length > 0) {
            setState((prev) => ({
              ...prev,
              courses: [...prev.courses, ...newBackendCourses],
            }));
          }
        }
        syncPromise = null;
      }).catch((err) => {
        console.error("Background sync failed:", err);
        syncPromise = null;
      });
    }
  }
  return state;
}

// Public function to manually sync with backend
export async function syncCoursesFromBackend(): Promise<void> {
  const backendCourses = await syncBackendCourses();
  if (backendCourses.length > 0) {
    const currentState = getCanonicalState();
    const existingIds = new Set(currentState.courses.map((c) => c.id));
    const newBackendCourses = backendCourses.filter((c) => !existingIds.has(c.id));
    const updatedCourses = backendCourses.filter((c) => existingIds.has(c.id));
    
    setState((prev) => {
      // Update existing courses - merge backend data while preserving canonical-specific fields
      const courses = prev.courses.map((c) => {
        const updated = updatedCourses.find((bc) => bc.id === c.id);
        if (updated) {
          // Merge: keep canonical fields (modules, pathSlug, phase, etc.) but update from backend
          return {
            ...c,
            title: updated.title,
            description: updated.description,
            status: updated.status,
            lastUpdated: updated.lastUpdated,
            // Preserve canonical-specific fields that backend doesn't have
            modules: c.modules || updated.modules || [],
            pathSlug: c.pathSlug || updated.pathSlug,
            phase: c.phase || updated.phase,
            roles: updated.roles.length > 0 ? updated.roles : c.roles,
          };
        }
        return c;
      });
      
      // Add new courses from backend
      return {
        ...prev,
        courses: [...courses, ...newBackendCourses],
      };
    });
  }
}

export function subscribeCanonical(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setState(updater: (prev: CanonicalStoreState) => CanonicalStoreState) {
  state = updater(getCanonicalState());
  saveState(state);
  listeners.forEach((l) => l());
}

// ——— Courses ———
export function getCoursesForInstructor(): CanonicalCourse[] {
  return [...getCanonicalState().courses].sort(
    (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
  );
}

// Course titles to hide from Available Courses (e.g. legacy or retired courses)
const EXCLUDED_COURSE_TITLES = [
  "AI with Python",
  "Artificial Intelligence with Python",
  "Programming Basics",
  "REST API Development",
  "Web Development",
];

export function getPublishedCoursesForPath(pathSlug: string): CanonicalCourse[] {
  return getCanonicalState().courses.filter(
    (c) =>
      c.pathSlug === pathSlug &&
      c.status === "published" &&
      !EXCLUDED_COURSE_TITLES.includes(c.title.trim())
  );
}

export function getCourseById(id: string): CanonicalCourse | undefined {
  const idStr = String(id);
  const fromStore = getCanonicalState().courses.find(
    (c) => String(c.id) === idStr || (c.backendId != null && String(c.backendId) === idStr)
  );
  if (idStr === "html-css" || idStr === "javascript-fundamentals") {
    const fromData = getCourseFromData(idStr);
    if (fromData?.modules?.length) {
      return { ...fromData, backendId: fromStore?.backendId ?? fromData.backendId };
    }
  }
  return fromStore;
}

export function addCourse(course: CanonicalCourse) {
  setState((prev) => ({
    ...prev,
    courses: [...prev.courses, course],
  }));
}

export function updateCourse(id: string, updates: Partial<CanonicalCourse>) {
  setState((prev) => ({
    ...prev,
    courses: prev.courses.map((c) =>
      c.id === id ? { ...c, ...updates, lastUpdated: new Date().toISOString().slice(0, 10) } : c
    ),
  }));
}

export function setCourseModules(id: string, modules: CanonicalModule[]) {
  setState((prev) => ({
    ...prev,
    courses: prev.courses.map((c) =>
      c.id === id
        ? {
            ...c,
            modules,
            lastUpdated: new Date().toISOString().slice(0, 10),
          }
        : c
    ),
  }));
}

export function archiveCourse(id: string) {
  updateCourse(id, { status: "archived" });
}

export function publishCourse(id: string) {
  updateCourse(id, { status: "published" });
}

export function deleteCourse(id: string) {
  setState((prev) => ({
    ...prev,
    courses: prev.courses.filter((c) => c.id !== id),
  }));
}

// ——— Assignments ———
export function getAssignments(): Assignment[] {
  return getCanonicalState().assignments;
}

export function getAssignmentById(id: string): Assignment | undefined {
  return getCanonicalState().assignments.find((a) => a.id === id);
}

export function addAssignment(assignment: Assignment) {
  setState((prev) => ({
    ...prev,
    assignments: [...prev.assignments, assignment],
  }));
}

export function updateAssignment(id: string, updates: Partial<Assignment>) {
  setState((prev) => ({
    ...prev,
    assignments: prev.assignments.map((a) => (a.id === id ? { ...a, ...updates } : a)),
  }));
}

// ——— Quizzes ———
export function getQuizConfigs(): Record<string, QuizConfig> {
  return getCanonicalState().quizConfigs;
}

export function getQuizConfig(id: string): QuizConfig | undefined {
  return getCanonicalState().quizConfigs[id];
}

export function addOrUpdateQuizConfig(config: QuizConfig) {
  setState((prev) => ({
    ...prev,
    quizConfigs: { ...prev.quizConfigs, [config.id]: config },
  }));
}

export function getAvailableAssessments(): { id: string; title: string; type: string }[] {
  const s = getCanonicalState();
  const items: { id: string; title: string; type: string }[] = [];
  Object.entries(s.quizConfigs).forEach(([id, q]) => {
    items.push({ id, title: q.title, type: "quiz" });
  });
  s.assignments.filter((a) => a.type !== "Quiz").forEach((a) => {
    items.push({ id: a.id, title: a.title, type: "assignment" });
  });
  return items;
}
