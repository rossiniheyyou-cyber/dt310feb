"use client";

import { useLearnerProgress } from "@/context/LearnerProgressContext";
import { HelpCircle } from "lucide-react";

export default function ReadinessOverviewCard() {
  const { getReadinessScore } = useLearnerProgress();
  const { score, status, mandatoryComplete, mandatoryTotal, courseCompletion } =
    getReadinessScore();

  const statusColors = {
    "On Track": "text-teal-600 bg-teal-50 border-teal-200",
    "Needs Attention": "text-amber-600 bg-amber-50 border-amber-200",
    "At Risk": "text-red-600 bg-red-50 border-red-200",
  };

  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-soft hover:shadow-medium transition-all duration-300 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-8 border-teal-100 bg-gradient-to-br from-teal-50 to-white flex items-center justify-center shadow-sm">
            <span className="text-teal-700 text-3xl font-bold">{score}%</span>
          </div>
          <div
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center cursor-help hover:bg-slate-50 transition-colors"
            title="Readiness is calculated from: course completion (50%), pending assignments (30%), overdue mandatory courses (20%)"
          >
            <HelpCircle size={14} className="text-slate-500" />
          </div>
        </div>
        <div>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wide mb-1">Learning Readiness Score</p>
          <p className="text-slate-900 text-2xl font-bold mt-1 mb-3">
            Skill Readiness
          </p>
          <span
            className={`inline-block px-4 py-1.5 rounded-lg text-sm font-semibold border-2 shadow-sm ${
              statusColors[status]
            }`}
          >
            {status}
          </span>
        </div>
      </div>
      <div className="space-y-5">
        <div>
          <div className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
            <span>Mandatory courses</span>
            <span className="text-teal-700">
              {mandatoryComplete}/{mandatoryTotal}
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${
                  mandatoryTotal > 0
                    ? (mandatoryComplete / mandatoryTotal) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
            <span>Course completion</span>
            <span className="text-teal-700">{courseCompletion}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${courseCompletion}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
