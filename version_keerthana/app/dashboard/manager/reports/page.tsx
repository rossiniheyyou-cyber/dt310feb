"use client";

import { useMemo, useState } from "react";
import { BarChart3, Download, FileText } from "lucide-react";
import { getCurrentUser } from "@/lib/currentUser";
import {
  platformUsers,
  getLearnersForManager,
  getDepartmentById,
  getTeamById,
  issuedCertificates,
} from "@/data/adminData";
import { useCanonicalStore } from "@/context/CanonicalStoreContext";

export default function ManagerReportsPage() {
  const user = getCurrentUser();
  const manager = useMemo(
    () => (user?.email ? platformUsers.find((u) => u.role === "manager" && u.email === user.email) : null),
    [user?.email]
  );
  const teamLearners = useMemo(() => (manager ? getLearnersForManager(manager.id) : []), [manager]);
  const { state } = useCanonicalStore();
  const published = state.courses.filter((c) => c.status === "published");

  const teamCourseIds = useMemo(() => {
    const ids = new Set<string>();
    teamLearners.forEach((l) => l.enrolledCourseIds.forEach((id) => ids.add(id)));
    return Array.from(ids);
  }, [teamLearners]);
  const teamCourses = published.filter((c) => teamCourseIds.includes(c.id));
  const teamCerts = issuedCertificates.filter((c) =>
    teamLearners.some((l) => l.id === c.learnerId)
  );
  const completionRate =
    teamCourses.length > 0
      ? Math.round(
          teamCourses.reduce((a, c) => a + c.completionRate, 0) / teamCourses.length
        )
      : 0;

  const [reportType, setReportType] = useState<string>("progress");
  const [exportFormat, setExportFormat] = useState<string>("csv");

  const dept = manager?.departmentId ? getDepartmentById(manager.departmentId) : null;
  const team = manager?.teamId ? getTeamById(manager.teamId) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Reports</h1>
        <p className="text-slate-500 mt-1">
          Team progress, skill readiness, and certification status. Export as CSV or PDF.
        </p>
        {dept && team && (
          <p className="text-sm text-slate-600 mt-2">
            {dept.name} → {team.name}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Select report
          </h2>
          <div className="space-y-2">
            {[
              { id: "progress", label: "Team progress report" },
              { id: "readiness", label: "Skill readiness report" },
              { id: "certification", label: "Certification status report" },
            ].map((r) => (
              <label key={r.id} className="flex items-center gap-3 py-2 cursor-pointer">
                <input
                  type="radio"
                  name="reportType"
                  value={r.id}
                  checked={reportType === r.id}
                  onChange={() => setReportType(r.id)}
                  className="rounded-full border-slate-300 text-blue-600"
                />
                <span className="text-slate-800">{r.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export format
          </h2>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="format"
                value="csv"
                checked={exportFormat === "csv"}
                onChange={() => setExportFormat("csv")}
                className="rounded-full border-slate-300 text-blue-600"
              />
              <span className="text-slate-800">CSV</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="format"
                value="pdf"
                checked={exportFormat === "pdf"}
                onChange={() => setExportFormat("pdf")}
                className="rounded-full border-slate-300 text-blue-600"
              />
              <span className="text-slate-800">PDF</span>
            </label>
          </div>
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            Export {reportType} as {exportFormat.toUpperCase()}
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Report summary
          </h2>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-2xl font-semibold text-slate-800">{teamLearners.length}</p>
            <p className="text-sm text-slate-500">Team learners</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-2xl font-semibold text-slate-800">{completionRate}%</p>
            <p className="text-sm text-slate-500">Team completion rate</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-2xl font-semibold text-slate-800">{teamCerts.length}</p>
            <p className="text-sm text-slate-500">Certificates earned by team</p>
          </div>
        </div>
        <div className="px-6 pb-6">
          <p className="text-sm text-slate-500">
            Full report data would be generated based on selected report type and exported in {exportFormat.toUpperCase()} format.
          </p>
        </div>
      </div>
    </div>
  );
}
