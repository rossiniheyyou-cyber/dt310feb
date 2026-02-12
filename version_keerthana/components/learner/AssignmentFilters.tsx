"use client";

import { useState, useMemo } from "react";
import { Search, Filter } from "lucide-react";
import { ROLES, ASSIGNMENT_TYPES } from "@/data/assignments";
import type { Assignment } from "@/data/assignments";
import { useCanonicalStore } from "@/context/CanonicalStoreContext";

const STATUSES = ["Assigned", "Due", "Submitted", "Reviewed", "Overdue"] as const;
const SORT_OPTIONS = [
  { value: "due-asc", label: "Due date (earliest first)" },
  { value: "due-desc", label: "Due date (latest first)" },
  { value: "priority", label: "Priority (overdue first)" },
  { value: "course", label: "Course" },
  { value: "role", label: "Role" },
] as const;

type FilterState = {
  search: string;
  role: string;
  course: string;
  status: string;
  type: string;
  sort: string;
};

export default function AssignmentFilters({
  onFilter,
}: {
  onFilter?: (filtered: Assignment[]) => void;
}) {
  const { getAssignments } = useCanonicalStore();
  const assignments = getAssignments();
  const COURSES = useMemo(() => [...new Set(assignments.map((a) => a.course))].sort(), [assignments]);

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    role: "",
    course: "",
    status: "",
    type: "",
    sort: "due-asc",
  });

  const applyFilters = (newFilters: Partial<FilterState>) => {
    const merged = { ...filters, ...newFilters };
    setFilters(merged);

    let result = [...assignments];

    if (merged.search) {
      const q = merged.search.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.course.toLowerCase().includes(q) ||
          a.module.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q)
      );
    }
    if (merged.role) {
      result = result.filter((a) => a.role === merged.role);
    }
    if (merged.course) {
      result = result.filter((a) => a.course === merged.course);
    }
    if (merged.status) {
      result = result.filter((a) => a.status === merged.status);
    }
    if (merged.type) {
      result = result.filter((a) => a.type === merged.type);
    }

    switch (merged.sort) {
      case "due-asc":
        result.sort(
          (a, b) =>
            new Date(a.dueDateISO).getTime() - new Date(b.dueDateISO).getTime()
        );
        break;
      case "due-desc":
        result.sort(
          (a, b) =>
            new Date(b.dueDateISO).getTime() - new Date(a.dueDateISO).getTime()
        );
        break;
      case "priority":
        result.sort((a, b) => {
          const order = { Overdue: 0, Due: 1, Assigned: 2, Submitted: 3, Reviewed: 4 };
          return (order[a.status as keyof typeof order] ?? 5) - (order[b.status as keyof typeof order] ?? 5);
        });
        break;
      case "course":
        result.sort((a, b) => a.course.localeCompare(b.course));
        break;
      case "role":
        result.sort((a, b) => a.role.localeCompare(b.role));
        break;
    }

    onFilter?.(result);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-teal-600" />
        <h3 className="font-semibold text-slate-800">Filters & Sorting</h3>
      </div>
      <div className="flex flex-wrap gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search assignment or course..."
            value={filters.search}
            onChange={(e) => applyFilters({ search: e.target.value })}
            className="border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-700 w-64 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <select
          value={filters.role}
          onChange={(e) => applyFilters({ role: e.target.value })}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">All Roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <select
          value={filters.course}
          onChange={(e) => applyFilters({ course: e.target.value })}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">All Courses</option>
          {COURSES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => applyFilters({ status: e.target.value })}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={filters.type}
          onChange={(e) => applyFilters({ type: e.target.value })}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">All Types</option>
          {ASSIGNMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={filters.sort}
          onChange={(e) => applyFilters({ sort: e.target.value })}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
