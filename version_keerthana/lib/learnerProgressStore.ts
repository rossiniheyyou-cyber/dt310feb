/**
 * Learner progress store - frontend only, persists to localStorage.
 * Used by Dashboard and My Courses to reflect dynamic learning state.
 */

import { getCurrentUser } from "@/lib/currentUser";

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

export type MandatoryCourse = {
  pathSlug: string;
  courseId: string;
  courseTitle: string;
  pathTitle: string;
  dueDate: string;
  completed: boolean;
  overdue?: boolean;
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
  mandatoryCourses: MandatoryCourse[];
  activityLog: ActivityEntry[];
  certificates: CertificateEntry[];
  totalLearningHours: number;
  skillsGained: string[];
};

const defaultState: LearnerProgressState = {
  enrolledPathSlugs: ["fullstack"],
  courseProgress: {
    "fullstack-prog-basics": {
      pathSlug: "fullstack",
      courseId: "prog-basics",
      courseTitle: "Programming Basics",
      pathTitle: "Full Stack Developer",
      completedModuleIds: ["m1", "m2"],
      currentModuleId: "m3",
      currentModuleTitle: "Control Flow",
      lastAccessedAt: new Date().toISOString(),
      courseCompleted: false,
      totalModules: 5,
    },
  },
  tasks: [
    {
      id: "t1",
      type: "quiz",
      title: "Module Quiz",
      courseTitle: "Programming Basics",
      pathSlug: "fullstack",
      courseId: "prog-basics",
      moduleId: "m5",
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      status: "pending",
    },
    {
      id: "t2",
      type: "assignment",
      title: "Practice Assignment",
      courseTitle: "Programming Basics",
      pathSlug: "fullstack",
      courseId: "prog-basics",
      moduleId: "m4",
      dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
      status: "pending",
    },
  ],
  mandatoryCourses: [
    {
      pathSlug: "fullstack",
      courseId: "prog-basics",
      courseTitle: "Programming Basics",
      pathTitle: "Full Stack Developer",
      dueDate: new Date(Date.now() + 86400000 * 14).toISOString(),
      completed: false,
      overdue: false,
    },
    {
      pathSlug: "fullstack",
      courseId: "web-fundamentals",
      courseTitle: "Web Fundamentals",
      pathTitle: "Full Stack Developer",
      dueDate: new Date(Date.now() + 86400000 * 21).toISOString(),
      completed: false,
      overdue: false,
    },
  ],
  activityLog: [
    {
      id: "a1",
      type: "module_completed",
      title: "Variables and Data Types",
      subtitle: "Programming Basics",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      pathSlug: "fullstack",
      courseId: "prog-basics",
      pathTitle: "Full Stack Developer",
      courseTitle: "Programming Basics",
    },
    {
      id: "a2",
      type: "course_accessed",
      title: "Programming Basics",
      subtitle: "Full Stack Developer",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      pathSlug: "fullstack",
      courseId: "prog-basics",
      pathTitle: "Full Stack Developer",
      courseTitle: "Programming Basics",
    },
  ],
  certificates: [],
  totalLearningHours: 4.5,
  skillsGained: ["Variables", "Loops", "Data Types"],
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

    const mandatoryCourses = prev.mandatoryCourses.map((mc) =>
      mc.pathSlug === pathSlug && mc.courseId === courseId
        ? { ...mc, completed: courseCompleted }
        : mc
    );

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
      mandatoryCourses,
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

export function getReadinessScore(): {
  score: number;
  status: "On Track" | "Needs Attention" | "At Risk";
  mandatoryComplete: number;
  mandatoryTotal: number;
  courseCompletion: number;
} {
  const s = getState();
  const mandatoryComplete = s.mandatoryCourses.filter((mc) => mc.completed).length;
  const mandatoryTotal = s.mandatoryCourses.length;
  const totalCourses = Object.values(s.courseProgress).length || 1;
  const completedCourses = Object.values(s.courseProgress).filter(
    (c) => c.courseCompleted
  ).length;
  const courseCompletion = mandatoryTotal > 0 ? (mandatoryComplete / mandatoryTotal) * 100 : 0;
  const pendingTasks = s.tasks.filter((t) => t.status === "pending").length;
  const overdueMandatory = s.mandatoryCourses.filter(
    (mc) => !mc.completed && mc.overdue
  ).length;

  let score = Math.round(
    courseCompletion * 0.5 +
      (100 - Math.min(pendingTasks * 10, 50)) * 0.3 +
      Math.max(0, 100 - overdueMandatory * 25) * 0.2
  );
  score = Math.min(100, Math.max(0, score));

  let status: "On Track" | "Needs Attention" | "At Risk" = "On Track";
  if (score < 50 || overdueMandatory > 0) status = "At Risk";
  else if (score < 75 || pendingTasks > 2) status = "Needs Attention";

  return {
    score,
    status,
    mandatoryComplete,
    mandatoryTotal,
    courseCompletion: Math.round(courseCompletion),
  };
}
