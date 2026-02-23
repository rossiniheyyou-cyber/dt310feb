"use client";

import Link from "next/link";
import { useLearnerProgress } from "@/context/LearnerProgressContext";
import { BookOpen, HelpCircle } from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatTimestamp(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

export default function RecentActivitySection() {
  const { state } = useLearnerProgress();
  const activities = (state.activityLog ?? []).slice(0, 5);

  return (
    <div className="rounded-2xl card-gradient border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
      <h3 className="text-base font-semibold text-slate-800 mb-4">Recent Learning Activity</h3>
      {activities.length === 0 ? (
        <p className="text-sm text-slate-500">Your learning activity will appear here.</p>
      ) : (
        <div className="space-y-2">
          {activities.map((a) => {
            const Icon = a.type === "quiz_completed" ? HelpCircle : BookOpen;
            const href =
              a.pathSlug && a.courseId
                ? `/dashboard/learner/courses/${a.pathSlug}/${a.courseId}`
                : "#";

            return (
              <Link
                key={a.id}
                href={href}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-50/50 hover:bg-teal-50 border border-transparent hover:border-teal-200 transition-all duration-200 hover:shadow-md group"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center flex-shrink-0 group-hover:from-teal-100 group-hover:to-teal-200 transition-all">
                  <Icon size={18} className="text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 group-hover:text-teal-800 truncate">
                    {a.title}
                  </p>
                  {a.subtitle && (
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{a.subtitle}</p>
                  )}
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">{formatTimestamp(a.timestamp)}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
