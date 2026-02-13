"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  getLearnerAssignmentsAssessments,
  type LearnerAssignmentsAssessmentsResponse,
  type QuizAssessment,
} from "@/lib/api/learnerAssignments";
import type { Assignment } from "@/data/assignments";

function mapQuizToAssignment(q: QuizAssessment): Assignment {
  return {
    id: q.id,
    title: q.title,
    course: q.course,
    courseId: q.courseId,
    pathSlug: q.pathSlug,
    module: q.module,
    moduleId: q.moduleId,
    role: q.role as Assignment["role"],
    type: "Quiz",
    dueDate: q.dueDate || "—",
    dueDateISO: q.dueDateISO || "",
    status: q.status as Assignment["status"],
  };
}

type LearnerAssignmentsContextValue = {
  assignments: Assignment[];
  quizzes: QuizAssessment[];
  summary: LearnerAssignmentsAssessmentsResponse["summary"] | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const LearnerAssignmentsContext = createContext<LearnerAssignmentsContextValue | null>(null);

export function LearnerAssignmentsProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<LearnerAssignmentsAssessmentsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const d = await getLearnerAssignmentsAssessments();
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

  const assignments = (data?.assignments ?? []) as Assignment[];
  const quizzes = data?.quizzes ?? [];
  const allAsAssignments: Assignment[] = [
    ...assignments,
    ...quizzes.map(mapQuizToAssignment),
  ];
  const summary = data?.summary ?? null;

  const value: LearnerAssignmentsContextValue = {
    assignments: allAsAssignments,
    quizzes,
    summary,
    loading,
    refresh,
  };

  return (
    <LearnerAssignmentsContext.Provider value={value}>
      {children}
    </LearnerAssignmentsContext.Provider>
  );
}

export function useLearnerAssignments() {
  const ctx = useContext(LearnerAssignmentsContext);
  return (
    ctx ?? {
      assignments: [],
      quizzes: [],
      summary: null,
      loading: true,
      refresh: async () => {},
    }
  );
}
