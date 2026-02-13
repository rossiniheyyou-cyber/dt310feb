"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Lock,
  Calendar,
  Clock,
} from "lucide-react";
import { learningPathProgress } from "@/data/progressData";

function getPhaseStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    case "in_progress":
      return <Circle className="w-5 h-5 text-teal-500 fill-teal-100" />;
    case "locked":
      return <Lock className="w-4 h-4 text-slate-400" />;
    default:
      return <Circle className="w-5 h-5 text-slate-300" />;
  }
}

function getPhaseStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "border-emerald-200 bg-emerald-50";
    case "in_progress":
      return "border-teal-200 bg-teal-50";
    case "locked":
      return "border-slate-200 bg-slate-50";
    default:
      return "border-slate-200 bg-white";
  }
}

export default function LearningPathProgress() {
  const [expanded, setExpanded] = useState(true);
  const data = learningPathProgress;

  const totalCourses = data.phases.reduce((sum, p) => sum + p.totalCourses, 0);
  const completedCourses = data.phases.reduce((sum, p) => sum + p.completedCourses, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="p-6 cursor-pointer hover:bg-slate-50 transition"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {expanded ? (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-slate-400" />
            )}
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Learning Path: {data.pathTitle}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">{data.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-2xl font-bold text-teal-600">{data.overallProgress}%</p>
              <p className="text-xs text-slate-500">Overall Progress</p>
            </div>
            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full"
                style={{ width: `${data.overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-6 mt-4 ml-8 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Duration: {data.totalDuration}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Started: {new Date(data.enrolledDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Expected: {new Date(data.expectedCompletion).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
            <span>
              {completedCourses} / {totalCourses} courses completed
            </span>
          </div>
        </div>
      </div>

      {/* Phases */}
      {expanded && (
        <div className="border-t border-slate-200 p-6 pt-4">
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200" />

            <div className="space-y-3">
              {data.phases.map((phase, index) => {
                const phaseProgress =
                  phase.totalCourses > 0
                    ? Math.round((phase.completedCourses / phase.totalCourses) * 100)
                    : 0;

                return (
                  <div key={phase.id} className="relative flex items-start gap-4">
                    {/* Status Icon */}
                    <div className="relative z-10 bg-white p-0.5">
                      {getPhaseStatusIcon(phase.status)}
                    </div>

                    {/* Phase Card */}
                    <div
                      className={`flex-1 rounded-lg border p-4 ${getPhaseStatusColor(
                        phase.status
                      )}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-slate-800">{phase.name}</h3>
                          {phase.status === "completed" && (
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                              Completed
                            </span>
                          )}
                          {phase.status === "in_progress" && (
                            <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                              In Progress
                            </span>
                          )}
                          {phase.status === "locked" && (
                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                              Locked
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-600">
                            {phase.completedCourses} / {phase.totalCourses} courses
                          </span>
                          {phase.status !== "locked" && (
                            <div className="w-24 h-1.5 bg-white rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  phase.status === "completed"
                                    ? "bg-emerald-500"
                                    : "bg-teal-500"
                                }`}
                                style={{ width: `${phaseProgress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
