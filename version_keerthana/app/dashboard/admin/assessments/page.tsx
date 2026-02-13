"use client";

import { useState } from "react";
import { Search, ClipboardList, FileText, HelpCircle } from "lucide-react";
import { useCanonicalStore } from "@/context/CanonicalStoreContext";

export default function AdminAssessmentsPage() {
  const { getAssignments, getQuizConfigs } = useCanonicalStore();
  const assignments = getAssignments();
  const quizConfigs = getQuizConfigs();
  const quizzes = Object.values(quizConfigs);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const allItems = [
    ...assignments.map((a) => ({
      id: a.id,
      title: a.title,
      type: "assignment" as const,
      course: a.course,
      courseId: a.courseId,
      module: a.module,
      dueDate: a.dueDate,
      dueDateISO: a.dueDateISO,
      submissions: 0,
      passRate: null as number | null,
    })),
    ...quizzes.map((q) => ({
      id: q.id,
      title: q.title,
      type: "quiz" as const,
      course: q.course,
      courseId: q.assignmentId ?? q.id,
      module: q.module,
      dueDate: "",
      dueDateISO: "",
      submissions: 0,
      passRate: q.passingScore ?? null,
    })),
  ];

  const filtered = allItems.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.course.toLowerCase().includes(search.toLowerCase()) ||
      item.module.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || item.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Assignments & Quizzes Oversight</h1>
        <p className="text-slate-500 mt-1">
          View all assignments and quizzes. Track submission status, pass/fail rates, and audit grading.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, course, or module..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-slate-800"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700"
        >
          <option value="all">All types</option>
          <option value="assignment">Assignments</option>
          <option value="quiz">Quizzes</option>
        </select>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-white via-teal-50/20 to-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Type</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Title</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Course</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Module</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Due date</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-slate-700">Submissions</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-slate-700">Pass rate</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50">
                  <td className="py-4 px-4">
                    {item.type === "quiz" ? (
                      <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                        <HelpCircle className="w-4 h-4" />
                        Quiz
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                        <FileText className="w-4 h-4" />
                        Assignment
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 font-medium text-slate-800">{item.title}</td>
                  <td className="py-4 px-4 text-sm text-slate-600">{item.course}</td>
                  <td className="py-4 px-4 text-sm text-slate-600">{item.module}</td>
                  <td className="py-4 px-4 text-sm text-slate-600">{item.dueDate || "—"}</td>
                  <td className="py-4 px-4 text-center text-sm text-slate-600">{item.submissions}</td>
                  <td className="py-4 px-4 text-center text-sm text-slate-600">
                    {item.passRate != null ? `${item.passRate}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No assignments or quizzes match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
