"use client";

import Link from "next/link";
import { useLearnerAssignments } from "@/context/LearnerAssignmentsContext";
import { ChevronRight } from "lucide-react";

export default function UpcomingTasksSection() {
  const { quizzes, loading } = useLearnerAssignments();

  const pendingQuizzes = quizzes.filter((q) => q.status === "Assigned");
  const upcomingTasks = pendingQuizzes.slice(0, 5);

  if (loading) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-white to-slate-50 border border-slate-200 p-6 animate-pulse">
        <div className="h-32 bg-slate-100 rounded" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-white via-teal-50/20 to-white border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
      <h3 className="text-base font-semibold text-slate-800 mb-4">Upcoming Tasks & Due Dates</h3>
      {upcomingTasks.length === 0 ? (
        <p className="text-sm text-slate-500">No upcoming assignments or quizzes.</p>
      ) : (
        <div className="space-y-2">
          {upcomingTasks.map((t) => (
            <Link
              key={t.id}
              href={`/dashboard/learner/quiz/${t.id}`}
              className="flex justify-between items-center p-3 rounded-lg bg-slate-50/80 hover:bg-teal-50 border border-transparent hover:border-teal-200 transition-all duration-200 hover:shadow-md group"
            >
              <div>
                <p className="text-sm font-medium text-slate-800 group-hover:text-teal-800">{t.title}</p>
                <p className="text-xs text-slate-500">{t.course}</p>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
