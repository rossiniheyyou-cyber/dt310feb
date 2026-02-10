"use client";

import Link from "next/link";
import { useLearnerProgress } from "@/context/LearnerProgressContext";
import { BookOpen, CheckCircle, FileText, HelpCircle } from "lucide-react";

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
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export default function RecentActivity() {
  const { state } = useLearnerProgress();
  const activities = state.activityLog?.slice(0, 8) ?? [];

  const iconMap = {
    course_accessed: BookOpen,
    module_completed: CheckCircle,
    assignment_submitted: FileText,
    quiz_completed: HelpCircle,
    course_completed: CheckCircle,
  };

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <h3 className="text-slate-900 font-semibold mb-4">
          Recent Learning Activity
        </h3>
        <p className="text-slate-600 text-sm">
          Your learning activity will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200">
      <h3 className="text-slate-900 font-semibold mb-4">
        Recent Learning Activity
      </h3>
      <div className="space-y-3">
        {activities.map((a, index) => {
          const Icon = iconMap[a.type] ?? BookOpen;
          const href =
            a.pathSlug && a.courseId
              ? `/dashboard/learner/courses/${a.pathSlug}/${a.courseId}`
              : "#";

          // Use a combination of id and index to ensure unique keys
          const uniqueKey = a.id ? `${a.id}-${index}` : `activity-${index}-${a.timestamp}`;

          return (
            <Link
              key={uniqueKey}
              href={href}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition group"
            >
              <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 group-hover:text-teal-700">
                  {a.title}
                </p>
                {a.subtitle && (
                  <p className="text-xs text-slate-500 mt-0.5">{a.subtitle}</p>
                )}
              </div>
              <span className="text-xs text-slate-400 flex-shrink-0">
                {formatTimestamp(a.timestamp)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
