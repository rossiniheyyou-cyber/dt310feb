"use client";

import { ClipboardList, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useLearnerAssignments } from "@/context/LearnerAssignmentsContext";

export default function AssignmentSummaryCards() {
  const { assignments, summary } = useLearnerAssignments();
  const total = summary
    ? summary.totalAssignments + summary.totalQuizzes
    : assignments.length;
  const completed = summary
    ? summary.completedAssignments + summary.completedQuizzes
    : assignments.filter(
        (a) => a.status === "Reviewed" || a.status === "Submitted"
      ).length;
  const pending = summary
    ? summary.pendingAssignments + summary.pendingQuizzes
    : assignments.filter(
        (a) => a.status === "Assigned" || a.status === "Due"
      ).length;
  const overdue = summary?.overdueAssignments ?? assignments.filter((a) => a.status === "Overdue").length;

  const cards = [
    {
      label: "Total Assignments",
      value: total,
      icon: ClipboardList,
      className: "border-teal-200 bg-white",
      iconClassName: "text-teal-600",
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCircle,
      className: "border-teal-200 bg-white",
      iconClassName: "text-teal-600",
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock,
      className: "border-slate-200 bg-white",
      iconClassName: "text-slate-600",
    },
    {
      label: "Overdue",
      value: overdue,
      icon: AlertCircle,
      className: overdue > 0 ? "border-red-200 bg-red-50/50" : "border-slate-200 bg-white",
      iconClassName: overdue > 0 ? "text-red-600" : "text-slate-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, className, iconClassName }) => (
        <div
          key={label}
          className={`rounded-xl border p-5 transition hover:shadow-sm ${className}`}
        >
          <Icon className={`h-6 w-6 mb-2 ${iconClassName}`} />
          <p className="text-sm text-slate-500 mt-1">{label}</p>
          <p className="text-2xl font-semibold text-slate-800">{value}</p>
        </div>
      ))}
    </div>
  );
}
