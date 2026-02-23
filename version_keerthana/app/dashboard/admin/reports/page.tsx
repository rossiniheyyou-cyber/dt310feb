"use client";

import { useState } from "react";
import { BarChart3, Download, FileText } from "lucide-react";
import { useCanonicalStore } from "@/context/CanonicalStoreContext";
import { platformUsers, getUsersByRole, departments } from "@/data/adminData";

export default function AdminReportsPage() {
  const { state } = useCanonicalStore();
  const courses = state.courses;
  const [reportType, setReportType] = useState<string>("progress");
  const [format, setFormat] = useState<"csv" | "pdf">("csv");

  const published = courses.filter((c) => c.status === "published");
  const learners = getUsersByRole("learner");
  const instructors = getUsersByRole("instructor");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Reports & Analytics</h1>
        <p className="text-slate-500 mt-1">
          Learner progress, course effectiveness, instructor performance, assignment analysis. Export CSV or PDF.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Report type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 min-w-[200px]"
          >
            <option value="progress">Learner progress report</option>
            <option value="course">Course effectiveness report</option>
            <option value="instructor">Instructor performance report</option>
            <option value="assignment">Assignment & quiz analysis</option>
            <option value="department">Department-wise learning performance</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Export format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as "csv" | "pdf")}
            className="px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 min-w-[120px]"
          >
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
          </select>
        </div>
        <div className="flex items-end">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700">
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl card-gradient border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Learner progress summary
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Total learners</span>
              <span className="font-medium text-slate-800">{learners.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Enrolled in at least one course</span>
              <span className="font-medium text-slate-800">{learners.filter((l) => l.enrolledCourseIds.length > 0).length}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl card-gradient border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Course effectiveness
          </h2>
          <div className="space-y-3 text-sm">
            {published.slice(0, 4).map((c) => (
              <div key={c.id} className="flex justify-between items-center">
                <span className="text-slate-600 truncate max-w-[200px]">{c.title}</span>
                <span className="font-medium text-slate-800">{c.completionRate}% completion</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl card-gradient border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
          <h2 className="font-semibold text-slate-800 mb-4">Instructor performance</h2>
          <div className="space-y-3 text-sm">
            {instructors.map((u) => (
              <div key={u.id} className="flex justify-between">
                <span className="text-slate-600">{u.name}</span>
                <span className="font-medium text-slate-800">{u.assignedCourseIds.length} courses</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl card-gradient border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
          <h2 className="font-semibold text-slate-800 mb-4">Department-wise</h2>
          <div className="space-y-3 text-sm">
            {departments.map((d) => {
              const deptLearners = learners.filter((l) => l.departmentId === d.id);
              return (
                <div key={d.id} className="flex justify-between">
                  <span className="text-slate-600">{d.name}</span>
                  <span className="font-medium text-slate-800">{deptLearners.length} learners</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
