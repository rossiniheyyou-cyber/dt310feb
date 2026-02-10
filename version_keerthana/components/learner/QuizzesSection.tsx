"use client";

import Link from "next/link";
import { Clock, HelpCircle, ChevronRight } from "lucide-react";
import AssignmentStatusBadge from "./AssignmentStatusBadge";
import { useCanonicalStore } from "@/context/CanonicalStoreContext";

export default function QuizzesSection() {
  const { getAssignments } = useCanonicalStore();
  const assignments = getAssignments();
  const quizzes = assignments.filter((a) => a.type === "Quiz");
  if (quizzes.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
        No quizzes available at the moment.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <h3 className="font-semibold text-slate-800">Module-level quizzes</h3>
        <p className="text-sm text-slate-500 mt-0.5">
          Timed MCQs and scenario-based questions • Auto-evaluation • Attempt limits
        </p>
      </div>
      <div className="divide-y divide-slate-100">
        {quizzes.map((q) => (
          <Link
            key={q.id}
            href={`/dashboard/learner/quiz/${q.id}`}
            className="flex items-center justify-between p-6 hover:bg-teal-50/50 transition"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-teal-100 p-3">
                <HelpCircle className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <h4 className="font-medium text-slate-800">{q.title}</h4>
                <p className="text-sm text-slate-500 mt-0.5">
                  {q.course} • {q.module}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                  {q.timeLimitMinutes && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {q.timeLimitMinutes} min
                    </span>
                  )}
                  {q.attemptLimit && (
                    <span>Attempts: {q.attemptLimit}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <AssignmentStatusBadge status={q.status} />
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
