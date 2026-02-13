"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { getLearnerDashboard } from "@/lib/api/learnerDashboard";
import type { LearnerDashboardData } from "@/lib/api/learnerDashboard";

const LearnerDashboardContext = createContext<{
  data: LearnerDashboardData | null;
  loading: boolean;
  refresh: () => Promise<void>;
} | null>(null);

export function LearnerDashboardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setData] = useState<LearnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const d = await getLearnerDashboard();
      setData(d);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <LearnerDashboardContext.Provider value={{ data, loading, refresh }}>
      {children}
    </LearnerDashboardContext.Provider>
  );
}

export function useLearnerDashboard() {
  const ctx = useContext(LearnerDashboardContext);
  return ctx ?? { data: null, loading: true, refresh: async () => {} };
}
