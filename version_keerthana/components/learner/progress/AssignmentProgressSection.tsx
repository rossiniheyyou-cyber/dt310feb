"use client";

import { useState } from "react";
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Send,
  ChevronDown,
  Star,
  MessageSquare,
} from "lucide-react";
import { assignmentProgress } from "@/data/progressData";

function getStatusConfig(status: string) {
  switch (status) {
    case "reviewed":
      return {
        label: "Reviewed",
        icon: CheckCircle2,
        bgColor: "bg-emerald-50",
        textColor: "text-emerald-700",
        borderColor: "border-emerald-200",
      };
    case "submitted":
      return {
        label: "Submitted",
        icon: Send,
        bgColor: "bg-blue-50",
        textColor: "text-blue-700",
        borderColor: "border-blue-200",
      };
    case "in_progress":
      return {
        label: "In Progress",
        icon: Clock,
        bgColor: "bg-amber-50",
        textColor: "text-amber-700",
        borderColor: "border-amber-200",
      };
    case "rework_required":
      return {
        label: "Rework Required",
        icon: RotateCcw,
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        borderColor: "border-red-200",
      };
    case "not_started":
    default:
      return {
        label: "Not Started",
        icon: FileText,
        bgColor: "bg-slate-50",
        textColor: "text-slate-600",
        borderColor: "border-slate-200",
      };
  }
}

export default function AssignmentProgressSection() {
  const [filter, setFilter] = useState<string>("all");
  const [showAll, setShowAll] = useState(false);

  // Group assignments by course
  const groupedByCourse = assignmentProgress.reduce((acc, assignment) => {
    if (!acc[assignment.courseName]) {
      acc[assignment.courseName] = [];
    }
    acc[assignment.courseName].push(assignment);
    return acc;
  }, {} as Record<string, typeof assignmentProgress>);

  // Calculate summary stats
  const totalAssignments = assignmentProgress.length;
  const reviewed = assignmentProgress.filter((a) => a.status === "reviewed").length;
  const submitted = assignmentProgress.filter((a) => a.status === "submitted").length;
  const inProgress = assignmentProgress.filter((a) => a.status === "in_progress").length;
  const notStarted = assignmentProgress.filter((a) => a.status === "not_started").length;
  const rework = assignmentProgress.filter((a) => a.status === "rework_required").length;

  const filteredAssignments = assignmentProgress.filter((a) => {
    if (filter === "all") return true;
    return a.status === filter;
  });

  const displayedAssignments = showAll ? filteredAssignments : filteredAssignments.slice(0, 6);

  const statusFilters = [
    { value: "all", label: "All", count: totalAssignments },
    { value: "reviewed", label: "Reviewed", count: reviewed },
    { value: "submitted", label: "Submitted", count: submitted },
    { value: "in_progress", label: "In Progress", count: inProgress },
    { value: "not_started", label: "Not Started", count: notStarted },
    { value: "rework_required", label: "Rework", count: rework },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Assignment Progress</h2>
          <p className="text-sm text-slate-500 mt-1">
            Track your assignment submissions and reviews
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">
            {reviewed + submitted} / {totalAssignments} completed
          </span>
          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full"
              style={{ width: `${((reviewed + submitted) / totalAssignments) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Reviewed", count: reviewed, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Submitted", count: submitted, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "In Progress", count: inProgress, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Not Started", count: notStarted, color: "text-slate-600", bg: "bg-slate-50" },
          { label: "Rework", count: rework, color: "text-red-600", bg: "bg-red-50" },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-lg p-3 text-center`}>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
            <p className="text-xs text-slate-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition ${
              filter === f.value
                ? "bg-teal-600 text-white border-teal-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Assignment List */}
      <div className="space-y-3">
        {displayedAssignments.map((assignment) => {
          const statusConfig = getStatusConfig(assignment.status);
          const StatusIcon = statusConfig.icon;

          return (
            <div
              key={assignment.id}
              className={`border ${statusConfig.borderColor} rounded-lg p-4 hover:shadow-sm transition`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${statusConfig.bgColor}`}>
                    <StatusIcon className={`w-5 h-5 ${statusConfig.textColor}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800">{assignment.title}</h3>
                    <p className="text-sm text-slate-500">{assignment.courseName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Score */}
                  {assignment.score !== undefined && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 text-amber-500" />
                      <span className="font-medium text-slate-800">
                        {assignment.score}/{assignment.maxScore}
                      </span>
                    </div>
                  )}

                  {/* Due Date */}
                  <div className="text-right">
                    <p className="text-sm text-slate-600">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                    {assignment.submittedAt && (
                      <p className="text-xs text-slate-400">
                        Submitted: {new Date(assignment.submittedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {statusConfig.label}
                  </span>
                </div>
              </div>

              {/* Feedback */}
              {assignment.feedback && (
                <div className="mt-3 pl-12">
                  <div className="flex items-start gap-2 text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                    <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5" />
                    <span>{assignment.feedback}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Show More Button */}
      {filteredAssignments.length > 6 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 w-full py-2 text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center justify-center gap-1"
        >
          {showAll ? "Show Less" : `Show All (${filteredAssignments.length})`}
          <ChevronDown className={`w-4 h-4 transition ${showAll ? "rotate-180" : ""}`} />
        </button>
      )}
    </div>
  );
}
