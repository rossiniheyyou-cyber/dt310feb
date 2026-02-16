/**
 * Learner progress store - frontend only, persists to localStorage.
 * Used by Dashboard and My Courses to reflect dynamic learning state.
 * All dashboard stats (enrolled, in progress, completed) are course-based, not video/module-based.
 */

import { getCurrentUser } from "@/lib/currentUser";
import { getLocalEnrolledCourseIds } from "@/lib/localEnrollments";

const STORAGE_KEY_BASE = "digitalt3-learner-progress";

function getStorageKey(): string {
  // Separate dashboard/progress per user (email) so each account has its own state.
  // Falls back to a shared key if no user is known yet.
  const user = getCurrentUser();
  const email = user?.email ? String(user.email).trim().toLowerCase() : "";
  return email ? `${STORAGE_KEY_BASE}:${email}` : STORAGE_KEY_BASE;
}

export type CourseProgressEntry = {
  pathSlug: string;
  courseId: string;
  courseTitle?: string;
  pathTitle?: string;
  currentModuleId: string | null;
  currentModuleTitle?: string;
  completedModuleIds: string[];
  lastAccessedAt: string;
  courseCompleted: boolean;
  totalModules: number;
};

export type Task = {
  id: string;
  type: "assignment" | "quiz" | "assessment";
  title: string;
  courseTitle: string;
  pathSlug: string;
  courseId: string;
  moduleId?: string;
  dueDate: string;
  status: "pending" | "submitted" | "overdue";
};

export type ActivityEntry = {
  id: string;
  type:
    | "course_accessed"
    | "module_completed"
    | "assignment_submitted"
    | "quiz_completed"
    | "course_completed";
  title: string;
  subtitle?: string;
  timestamp: string;
  pathSlug?: string;
  courseId?: string;
  pathTitle?: string;
  courseTitle?: string;
};

export type CertificateEntry = {
  pathSlug: string;
  courseId: string;
  courseTitle: string;
  pathTitle: string;
  earnedAt: string;
};

export type LearnerProgressState = {
  enrolledPathSlugs: string[];
  courseProgress: Record<string, CourseProgressEntry>;
  tasks: Task[];
  activityLog: ActivityEntry[];
  certificates: CertificateEntry[];
  totalLearningHours: number;
  skillsGained: string[];
};

const defaultState: LearnerProgressState = {
  enrolledPathSlugs: ["fullstack"],
  courseProgress: {},
  tasks: [],
  activityLog: [],
  certificates: [],
  totalLearningHours: 0,
  skillsGained: [],
};

function loadState(): LearnerProgressState {
  if (typeof window === "undefined") return defaultState;
  try {
    const stored = localStorage.getItem(getStorageKey());
    if (stored) {
      const parsed = JSON.parse(stored) as LearnerProgressState;
      return { ...defaultState, ...parsed };
    }
  } catch (_) {}
  return defaultState;
}

function saveState(state: LearnerProgressState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(state));
  } catch (_) {}
}

let state = defaultState;
let currentKey: string | null = null;
const listeners = new Set<() => void>();

/** Initial state for first render (server + client) to avoid hydration mismatch. */
export function getInitialState(): LearnerProgressState {
  return defaultState;
}

export function getState(): LearnerProgressState {
  if (typeof window !== "undefined") {
    const key = getStorageKey();
    if (currentKey !== key) {
      currentKey = key;
      state = loadState();
    } else if (state === defaultState) {
      state = loadState();
    }
  }
  return state;
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setState(updater: (prev: LearnerProgressState) => LearnerProgressState) {
  state = updater(getState());
  saveState(state);
  listeners.forEach((l) => l());
}

export function enrollInPath(pathSlug: string) {
  setState((prev) => {
    if (prev.enrolledPathSlugs.includes(pathSlug)) return prev;
    return {
      ...prev,
      enrolledPathSlugs: [...prev.enrolledPathSlugs, pathSlug],
    };
  });
}

export function recordCourseAccess(
  pathSlug: string,
  courseId: string,
  courseTitle: string,
  pathTitle: string,
  currentModuleId: string | null,
  currentModuleTitle: string | null,
  totalModules: number,
  completedModuleIds: string[]
) {
  const key = `${pathSlug}-${courseId}`;
  setState((prev) => {
    const existing = prev.courseProgress[key];
    const entry: CourseProgressEntry = {
      pathSlug,
      courseId,
      courseTitle,
      pathTitle,
      completedModuleIds: completedModuleIds ?? existing?.completedModuleIds ?? [],
      currentModuleId: currentModuleId ?? existing?.currentModuleId ?? null,
      currentModuleTitle: currentModuleTitle ?? existing?.currentModuleTitle ?? undefined,
      lastAccessedAt: new Date().toISOString(),
      courseCompleted: (completedModuleIds?.length ?? 0) >= totalModules,
      totalModules,
    };
    const activity: ActivityEntry = {
      id: `act-${Date.now()}`,
      type: "course_accessed",
      title: courseTitle,
      subtitle: pathTitle,
      timestamp: new Date().toISOString(),
      pathSlug,
      courseId,
      pathTitle,
      courseTitle,
    };
    return {
      ...prev,
      courseProgress: { ...prev.courseProgress, [key]: entry },
      enrolledPathSlugs: prev.enrolledPathSlugs.includes(pathSlug)
        ? prev.enrolledPathSlugs
        : [...prev.enrolledPathSlugs, pathSlug],
      activityLog: [activity, ...prev.activityLog].slice(0, 50),
    };
  });
}

export function recordModuleComplete(
  pathSlug: string,
  courseId: string,
  courseTitle: string,
  pathTitle: string,
  moduleId: string,
  moduleTitle: string,
  totalModules: number,
  courseSkills: string[] = []
) {
  const key = `${pathSlug}-${courseId}`;
  setState((prev) => {
    const existing = prev.courseProgress[key];
    const completed = existing?.completedModuleIds ?? [];
    const newCompleted = completed.includes(moduleId) ? completed : [...completed, moduleId];
    const courseCompleted = newCompleted.length >= totalModules;

    const activity: ActivityEntry = {
      id: `act-${Date.now()}`,
      type: courseCompleted ? "course_completed" : "module_completed",
      title: courseCompleted ? courseTitle : moduleTitle,
      subtitle: courseTitle,
      timestamp: new Date().toISOString(),
      pathSlug,
      courseId,
      pathTitle,
      courseTitle,
    };

    const certificates = courseCompleted
      ? [
          ...prev.certificates,
          {
            pathSlug,
            courseId,
            courseTitle,
            pathTitle,
            earnedAt: new Date().toISOString(),
          },
        ]
      : prev.certificates;

    const newSkills =
      courseCompleted && courseSkills.length > 0
        ? [
            ...new Set([
              ...(prev.skillsGained ?? []),
              ...courseSkills,
            ]),
          ]
        : prev.skillsGained ?? [];

    return {
      ...prev,
      courseProgress: {
        ...prev.courseProgress,
        [key]: {
          ...existing,
          pathSlug,
          courseId,
          courseTitle: existing?.courseTitle ?? courseTitle,
          pathTitle: existing?.pathTitle ?? pathTitle,
          completedModuleIds: newCompleted,
          currentModuleId: existing?.currentModuleId ?? null,
          lastAccessedAt: new Date().toISOString(),
          courseCompleted,
          totalModules,
        },
      },
      activityLog: [activity, ...prev.activityLog].slice(0, 50),
      certificates,
      totalLearningHours: prev.totalLearningHours + 0.25,
      skillsGained: newSkills,
    };
  });
}

export function addLearningHours(hours: number) {
  setState((prev) => ({
    ...prev,
    totalLearningHours: prev.totalLearningHours + hours,
  }));
}

export function getMostRecentCourse(): {
  pathSlug: string;
  courseId: string;
  courseTitle: string;
  pathTitle: string;
  currentModule: string | null;
  currentModuleTitle: string;
  progress: number;
  totalModules: number;
  completedCount: number;
} | null {
  const s = getState();
  let mostRecent: CourseProgressEntry | null = null;
  for (const entry of Object.values(s.courseProgress)) {
    if (
      !entry.courseCompleted &&
      (!mostRecent || entry.lastAccessedAt > mostRecent.lastAccessedAt)
    ) {
      mostRecent = entry;
    }
  }
  if (!mostRecent) return null;
  const progress =
    mostRecent.totalModules > 0
      ? Math.round(
          (mostRecent.completedModuleIds.length / mostRecent.totalModules) * 100
        )
      : 0;
  return {
    pathSlug: mostRecent.pathSlug,
    courseId: mostRecent.courseId,
    courseTitle: mostRecent.courseTitle ?? mostRecent.pathSlug,
    pathTitle: mostRecent.pathTitle ?? mostRecent.pathSlug,
    currentModule: mostRecent.currentModuleId,
    currentModuleTitle: mostRecent.currentModuleTitle ?? "Continue",
    progress,
    totalModules: mostRecent.totalModules,
    completedCount: mostRecent.completedModuleIds.length,
  };
}

/** Dashboard stats from local progress - all counts are course-based, not video-based */
export function getDashboardStats() {
  const s = getState();
  const entries = Object.values(s.courseProgress);
  const progressCourseIds = new Set(entries.map((e) => e.courseId));
  const localEnrolledIds = getLocalEnrolledCourseIds();
  const allCourseIds = new Set([...progressCourseIds, ...localEnrolledIds]);
  const enrolled = allCourseIds.size;
  const completed = entries.filter((e) => e.courseCompleted).length;
  const inProgress = Math.max(0, enrolled - completed);
  const totalHours = s.totalLearningHours ?? 0;

  // Streak: consecutive days with activity (from activityLog)
  const activityDates = new Set<string>();
  for (const a of s.activityLog ?? []) {
    if (a.timestamp) {
      const d = new Date(a.timestamp);
      activityDates.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    }
  }
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (activityDates.has(key)) streak++;
    else if (i > 0) break;
  }

  return { enrolled, inProgress, completed, totalHours, streak };
}

/** Daily activity for chart - hours per day this week */
export function getDailyActivityForChart() {
  const s = getState();
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7; // Mon=0
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - dayOfWeek);
  weekStart.setHours(0, 0, 0, 0);

  const dayHours: Record<number, number> = {};
  for (let i = 0; i < 7; i++) dayHours[i] = 0;

  for (const a of s.activityLog ?? []) {
    if (!a.timestamp) continue;
    const d = new Date(a.timestamp);
    const diff = Math.floor((d.getTime() - weekStart.getTime()) / (24 * 60 * 60 * 1000));
    if (diff >= 0 && diff < 7) {
      dayHours[diff] = (dayHours[diff] ?? 0) + 0.25; // ~15 min per activity
    }
  }

  const totalThisWeek = Object.values(dayHours).reduce((s, h) => s + h, 0);
  return {
    dailyActivity: days.map((day, i) => ({ day, hours: Math.round((dayHours[i] ?? 0) * 100) / 100 })),
    totalHoursThisWeek: Math.round(totalThisWeek * 100) / 100,
  };
}

export function getReadinessScore(): {
  score: number;
  status: "On Track" | "Needs Attention" | "At Risk";
  courseCompletion: number;
} {
  const s = getState();
  const totalCourses = Object.values(s.courseProgress).length || 1;
  const completedCourses = Object.values(s.courseProgress).filter(
    (c) => c.courseCompleted
  ).length;
  const courseCompletion = totalCourses > 0 ? (completedCourses / totalCourses) * 100 : 0;
  const pendingTasks = s.tasks.filter((t) => t.status === "pending").length;

  let score = Math.round(
    courseCompletion * 0.5 +
      (100 - Math.min(pendingTasks * 10, 50)) * 0.3 +
      100 * 0.2
  );
  score = Math.min(100, Math.max(0, score));

  let status: "On Track" | "Needs Attention" | "At Risk" = "On Track";
  if (score < 50) status = "At Risk";
  else if (score < 75 || pendingTasks > 2) status = "Needs Attention";

  return {
    score,
    status,
    courseCompletion: Math.round(courseCompletion),
  };
}
