"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  getState,
  getInitialState,
  subscribe,
  enrollInPath,
  recordCourseAccess,
  recordModuleComplete,
  getMostRecentCourse,
  getReadinessScore,
  getDashboardStats,
  getDailyActivityForChart,
  type LearnerProgressState,
} from "@/lib/learnerProgressStore";

const LearnerProgressContext = createContext<{
  state: LearnerProgressState;
  refresh: () => void;
  enrollInPath: typeof enrollInPath;
  recordCourseAccess: typeof recordCourseAccess;
  recordModuleComplete: typeof recordModuleComplete;
  getMostRecentCourse: typeof getMostRecentCourse;
  getReadinessScore: typeof getReadinessScore;
  getDashboardStats: typeof getDashboardStats;
  getDailyActivityForChart: typeof getDailyActivityForChart;
} | null>(null);

export function LearnerProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<LearnerProgressState>(() => getInitialState());

  const refresh = useCallback(() => {
    setState(getState());
  }, []);

  useEffect(() => {
    setState(getState());
    return subscribe(refresh);
  }, [refresh]);

  return (
    <LearnerProgressContext.Provider
      value={{
        state,
        refresh,
        enrollInPath,
        recordCourseAccess,
        recordModuleComplete,
        getMostRecentCourse,
        getReadinessScore,
        getDashboardStats,
        getDailyActivityForChart,
      }}
    >
      {children}
    </LearnerProgressContext.Provider>
  );
}

export function useLearnerProgress() {
  const ctx = useContext(LearnerProgressContext);
  if (!ctx) {
    throw new Error("useLearnerProgress must be used within LearnerProgressProvider");
  }
  return ctx;
}
