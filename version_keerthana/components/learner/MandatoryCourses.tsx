"use client";

import Link from "next/link";
import { useLearnerProgress } from "@/context/LearnerProgressContext";
import { ChevronRight, AlertCircle, CheckCircle } from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDueDate(isoDate: string): string {
  const date = new Date(isoDate);
  const d = date.getDate();
  const m = MONTHS[date.getMonth()];
  const y = date.getFullYear();
  return `${m} ${d}, ${y}`;
}

export default function MandatoryCourses() {
  const { state } = useLearnerProgress();
  const mandatory = state.mandatoryCourses;

  if (mandatory.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <h3 className="text-slate-900 font-semibold mb-4">
          Assigned & Mandatory Courses
        </h3>
        <p className="text-slate-600 text-sm">
          No mandatory courses assigned.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200">
      <h3 className="text-slate-900 font-semibold mb-4">
        Assigned & Mandatory Courses
      </h3>
      <div className="space-y-3">
        {mandatory.map((mc) => {
          const isOverdue = mc.overdue ?? false;
          const href = `/dashboard/learner/courses/${mc.pathSlug}/${mc.courseId}`;

          return (
            <Link
              key={`${mc.pathSlug}-${mc.courseId}`}
              href={href}
              className={`flex justify-between items-center p-4 rounded-xl border transition group ${
                mc.completed
                  ? "bg-slate-50 border-slate-200"
                  : isOverdue
                  ? "bg-amber-50/50 border-amber-200 hover:border-amber-300"
                  : "bg-white border-slate-200 hover:border-teal-200"
              }`}
            >
              <div className="flex items-center gap-3">
                {mc.completed ? (
                  <CheckCircle size={20} className="text-teal-600 flex-shrink-0" />
                ) : isOverdue ? (
                  <AlertCircle size={20} className="text-amber-600 flex-shrink-0" />
                ) : null}
                <div>
                  <p className="font-medium text-slate-900">{mc.courseTitle}</p>
                  <p className="text-sm text-slate-500">{mc.pathTitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm font-medium ${
                    mc.completed
                      ? "text-teal-600"
                      : isOverdue
                      ? "text-amber-600"
                      : "text-slate-500"
                  }`}
                >
                  {mc.completed ? "Completed" : formatDueDate(mc.dueDate)}
                </span>
                {!mc.completed && (
                  <ChevronRight size={16} className="text-slate-400 group-hover:text-teal-600" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
