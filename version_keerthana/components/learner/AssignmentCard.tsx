"use client";

import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import AssignmentStatusBadge from "./AssignmentStatusBadge";
import type { Assignment } from "@/data/assignments";

type Props = {
  assignment: Assignment;
};

function getCTALabel(assignment: Assignment): string {
  if (assignment.type === "Quiz") {
    switch (assignment.status) {
      case "Assigned":
      case "Due":
        return "Start Quiz";
      case "Submitted":
      case "Reviewed":
        return "View Results";
      default:
        return "View Quiz";
    }
  }
  switch (assignment.status) {
    case "Assigned":
    case "Due":
      return "Start Assignment";
    case "Submitted":
      return "View Submission";
    case "Reviewed":
      return "View Feedback";
    case "Overdue":
      return "Submit Now";
    default:
      return "View";
  }
}

function getHref(assignment: Assignment): string {
  if (assignment.type === "Quiz") {
    return `/dashboard/learner/quiz/${assignment.id}`;
  }
  return `/dashboard/learner/assignments/${assignment.id}`;
}

export default function AssignmentCard({ assignment }: Props) {
  const ctaLabel = getCTALabel(assignment);
  const href = getHref(assignment);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-teal-300 hover:shadow-sm transition">
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-slate-800 line-clamp-2">
            {assignment.title}
          </h3>
          <AssignmentStatusBadge status={assignment.status} />
        </div>

        <div className="space-y-2 text-sm text-slate-600 mb-4 flex-1">
          <p>
            <span className="text-slate-500">Course:</span> {assignment.course}
          </p>
          <p>
            <span className="text-slate-500">Module:</span> {assignment.module}
          </p>
          <p>
            <span className="text-slate-500">Role:</span>{" "}
            <span className="font-medium text-slate-700">{assignment.role}</span>
          </p>
          <p>
            <span className="text-slate-500">Type:</span> {assignment.type}
          </p>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>Due {assignment.dueDate}</span>
            {(assignment.isDueToday || assignment.isOverdue) && (
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded ${
                  assignment.isOverdue
                    ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {assignment.isOverdue ? "Overdue" : "Due today"}
              </span>
            )}
          </div>
        </div>

        <Link
          href={href}
          className="inline-flex items-center gap-1.5 text-teal-600 font-medium text-sm hover:text-teal-700"
        >
          {ctaLabel}
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
