"use client";

import { useState } from "react";
import {
  Download,
  TrendingUp,
  FileText,
  BookOpen,
} from "lucide-react";
import { reportSummaries } from "@/data/instructorData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export default function InstructorReportsPage() {
  const [reportType, setReportType] = useState<"courses" | "assessments" | "skills">("courses");

  const reportTabs = [
    { id: "courses" as const, label: "Course Completion", icon: BookOpen },
    { id: "assessments" as const, label: "Assessment Performance", icon: FileText },
    { id: "skills" as const, label: "Skill Readiness", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Reports</h1>
          <p className="text-slate-500 mt-1">Course completion, assessment performance, and analytics</p>
        </div>
        <button
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition"
          title="Export (future-ready)"
        >
          <Download className="w-5 h-5" />
          Export
        </button>
      </div>

      {/* Report Type Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {reportTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                reportType === tab.id
                  ? "bg-teal-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Course Completion Report */}
      {reportType === "courses" && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-white via-teal-50/20 to-white border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
            <h2 className="font-semibold text-slate-800 mb-4">Course Completion Report</h2>
            <div className="h-64 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportSummaries.courseCompletion}>
                  <XAxis dataKey="course" stroke="#64748b" fontSize={12} tick={{ fill: "#64748b" }} />
                  <YAxis stroke="#64748b" fontSize={12} tick={{ fill: "#64748b" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="completed" fill="#0d9488" radius={[4, 4, 0, 0]} name="Completion %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 text-sm font-semibold text-slate-700">Course</th>
                    <th className="text-right py-3 text-sm font-semibold text-slate-700">Completed</th>
                    <th className="text-right py-3 text-sm font-semibold text-slate-700">Enrolled</th>
                  </tr>
                </thead>
                <tbody>
                  {reportSummaries.courseCompletion.map((row) => (
                    <tr key={row.course} className="border-b border-slate-100 last:border-none">
                      <td className="py-3 text-slate-800">{row.course}</td>
                      <td className="py-3 text-right font-medium text-slate-800">{row.completed}%</td>
                      <td className="py-3 text-right text-slate-600">{row.enrolled}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Assessment Performance Report */}
      {reportType === "assessments" && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-white via-teal-50/20 to-white border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
            <h2 className="font-semibold text-slate-800 mb-4">Assessment Performance Report</h2>
            <div className="h-64 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportSummaries.assessmentPerformance}>
                  <XAxis dataKey="assessment" stroke="#64748b" fontSize={12} tick={{ fill: "#64748b" }} />
                  <YAxis stroke="#64748b" fontSize={12} tick={{ fill: "#64748b" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="avgScore" fill="#6366f1" radius={[4, 4, 0, 0]} name="Avg Score %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 text-sm font-semibold text-slate-700">Assessment</th>
                    <th className="text-right py-3 text-sm font-semibold text-slate-700">Avg Score</th>
                    <th className="text-right py-3 text-sm font-semibold text-slate-700">Submissions</th>
                  </tr>
                </thead>
                <tbody>
                  {reportSummaries.assessmentPerformance.map((row) => (
                    <tr key={row.assessment} className="border-b border-slate-100 last:border-none">
                      <td className="py-3 text-slate-800">{row.assessment}</td>
                      <td className="py-3 text-right font-medium text-slate-800">{row.avgScore}%</td>
                      <td className="py-3 text-right text-slate-600">{row.submissions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Skill Readiness Report */}
      {reportType === "skills" && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-white via-teal-50/20 to-white border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
            <h2 className="font-semibold text-slate-800 mb-4">Skill Readiness Summary</h2>
            <div className="h-64 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportSummaries.skillReadiness} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" stroke="#64748b" fontSize={12} tick={{ fill: "#64748b" }} domain={[0, 100]} />
                  <YAxis dataKey="skill" type="category" stroke="#64748b" fontSize={12} tick={{ fill: "#64748b" }} width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="avgLevel" fill="#0d9488" radius={[0, 4, 4, 0]} name="Avg Level %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 text-sm font-semibold text-slate-700">Skill</th>
                    <th className="text-right py-3 text-sm font-semibold text-slate-700">Avg Level</th>
                    <th className="text-right py-3 text-sm font-semibold text-slate-700">Learners</th>
                  </tr>
                </thead>
                <tbody>
                  {reportSummaries.skillReadiness.map((row) => (
                    <tr key={row.skill} className="border-b border-slate-100 last:border-none">
                      <td className="py-3 text-slate-800">{row.skill}</td>
                      <td className="py-3 text-right font-medium text-slate-800">{row.avgLevel}%</td>
                      <td className="py-3 text-right text-slate-600">{row.learners}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Export Ready Note */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
        <p className="text-sm text-teal-800">
          <strong>Export-ready UI:</strong> Reports are designed for future export (CSV, PDF). Connect to your backend when ready.
        </p>
      </div>
    </div>
  );
}
