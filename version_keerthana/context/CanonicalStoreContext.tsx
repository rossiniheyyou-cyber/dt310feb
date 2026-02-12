"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  getCanonicalState,
  subscribeCanonical,
  getCoursesForInstructor,
  getPublishedCoursesForPath,
  getCourseById,
  addCourse,
  updateCourse,
  setCourseModules,
  archiveCourse,
  publishCourse,
  deleteCourse,
  getAssignments,
  getAssignmentById,
  addAssignment,
  updateAssignment,
  getQuizConfigs,
  getQuizConfig,
  addOrUpdateQuizConfig,
  getAvailableAssessments,
  syncCoursesFromBackend,
  type CanonicalStoreState,
} from "@/lib/canonicalStore";
import type { CanonicalCourse, CanonicalModule } from "@/data/canonicalCourses";
import type { Assignment } from "@/data/assignments";
import type { QuizConfig } from "@/data/quizData";

type CanonicalContextValue = {
  state: CanonicalStoreState;
  refresh: () => void;
  // Courses
  getCoursesForInstructor: typeof getCoursesForInstructor;
  getPublishedCoursesForPath: typeof getPublishedCoursesForPath;
  getCourseById: (id: string) => CanonicalCourse | undefined;
  addCourse: typeof addCourse;
  updateCourse: typeof updateCourse;
  setCourseModules: typeof setCourseModules;
  archiveCourse: typeof archiveCourse;
  publishCourse: typeof publishCourse;
  deleteCourse: typeof deleteCourse;
  // Assignments
  getAssignments: typeof getAssignments;
  getAssignmentById: typeof getAssignmentById;
  addAssignment: typeof addAssignment;
  updateAssignment: typeof updateAssignment;
  // Quizzes
  getQuizConfigs: typeof getQuizConfigs;
  getQuizConfig: typeof getQuizConfig;
  addOrUpdateQuizConfig: typeof addOrUpdateQuizConfig;
  getAvailableAssessments: typeof getAvailableAssessments;
};

const CanonicalStoreContext = createContext<CanonicalContextValue | null>(null);

export function CanonicalStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CanonicalStoreState>(() => getCanonicalState());

  const refresh = useCallback(() => {
    setState(getCanonicalState());
  }, []);

  useEffect(() => {
    setState(getCanonicalState());
    const unsub = subscribeCanonical(refresh);
    
    // Sync courses from backend on mount (only on client)
    if (typeof window !== "undefined") {
      syncCoursesFromBackend()
        .then(() => {
          refresh(); // Refresh state after sync
        })
        .catch((err) => {
          console.error("Failed to sync courses from backend:", err);
        });

      // Near real-time updates: poll backend courses periodically (keeps learner/admin/instructor in sync)
      const interval = setInterval(() => {
        syncCoursesFromBackend().then(refresh).catch(() => {});
      }, 10000);
      return () => {
        clearInterval(interval);
        unsub();
      };
    }
    
    return () => {
      unsub();
    };
  }, [refresh]);

  const value: CanonicalContextValue = {
    state,
    refresh,
    getCoursesForInstructor,
    getPublishedCoursesForPath,
    getCourseById: (id) => getCourseById(id),
    addCourse,
    updateCourse,
    setCourseModules,
  archiveCourse,
  publishCourse,
  deleteCourse,
  getAssignments,
    getAssignmentById: (id) => getAssignmentById(id),
    addAssignment,
    updateAssignment,
    getQuizConfigs,
    getQuizConfig: (id) => getQuizConfig(id),
    addOrUpdateQuizConfig,
    getAvailableAssessments,
  };

  return (
    <CanonicalStoreContext.Provider value={value}>
      {children}
    </CanonicalStoreContext.Provider>
  );
}

export function useCanonicalStore() {
  const ctx = useContext(CanonicalStoreContext);
  if (!ctx) {
    throw new Error("useCanonicalStore must be used within CanonicalStoreProvider");
  }
  return ctx;
}
