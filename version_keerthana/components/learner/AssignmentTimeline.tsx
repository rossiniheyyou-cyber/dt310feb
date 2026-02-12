"use client";

import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import AssignmentStatusBadge from "./AssignmentStatusBadge";
import type { Assignment } from "@/data/assignments";
import { useCanonicalStore } from "@/context/CanonicalStoreContext";

function groupByRoleAndCourse(items: Assignment[]) {
  const groups: Record<string, Assignment[]> = {};
  for (const a of items) {
    const key = `${a.role} / ${a.course}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(a);
  }
  for (const key of Object.keys(groups)) {
    groups[key].sort(
      (a, b) => new Date(a.dueDateISO).getTime() - new Date(b.dueDateISO).getTime()
    );
  }
  return groups;
}

export default function AssignmentTimeline() {
  const { getAssignments } = useCanonicalStore();
  const assignments = getAssignments();
  const sorted = [...assignments].sort(
    (a, b) => new Date(a.dueDateISO).getTime() - new Date(b.dueDateISO).getTime()
  );
  const groups = groupByRoleAndCourse(sorted);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <h2 className="text-lg font-semibold text-slate-800">
          Assignment Timeline
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Chronological view grouped by role and course
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {Object.entries(groups).map(([groupLabel, items]) => (
          <div key={groupLabel} className="p-6">
            <h3 className="text-sm font-semibold text-teal-700 mb-4">
              {groupLabel}
            </h3>
            <div className="relative pl-6 border-l-2 border-slate-200 ml-1 space-y-4">
              {items.map((a) => (
                <div key={a.id} className="relative -ml-6">
                  <div
                    className={`absolute left-0 w-3 h-3 rounded-full -translate-x-[7px] mt-1.5 ${
                      a.isOverdue
                        ? "bg-red-500"
                        : a.isDueToday
                          ? "bg-amber-500"
                          : a.status === "Reviewed" || a.status === "Submitted"
                            ? "bg-teal-500"
                            : "bg-slate-300"
                    }`}
                  />
                  <Link
                    href={`/dashboard/learner/assignments/${a.id}`}
                    className="block p-4 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50/30 transition"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-800">{a.title}</p>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {a.module}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <AssignmentStatusBadge status={a.status} />
                        {(a.isDueToday || a.isOverdue) && (
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded ${
                              a.isOverdue
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {a.isOverdue ? "Overdue" : "Due today"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                      <Calendar className="h-4 w-4" />
                      <span>Due {a.dueDate}</span>
                      <ChevronRight className="h-4 w-4 text-slate-400 ml-auto" />
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
