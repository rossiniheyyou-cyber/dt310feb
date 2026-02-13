"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { getLearnerProgress, type LearnerProgressData } from "@/lib/api/learnerProgress";

const LearnerProgressPageContext = createContext<{
  data: LearnerProgressData | null;
  loading: boolean;
  refresh: () => Promise<void>;
} | null>(null);

export function LearnerProgressPageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setData] = useState<LearnerProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const d = await getLearnerProgress();
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
    <LearnerProgressPageContext.Provider value={{ data, loading, refresh }}>
      {children}
    </LearnerProgressPageContext.Provider>
  );
}

export function useLearnerProgressPage() {
  const ctx = useContext(LearnerProgressPageContext);
  return ctx ?? { data: null, loading: true, refresh: async () => {} };
}
