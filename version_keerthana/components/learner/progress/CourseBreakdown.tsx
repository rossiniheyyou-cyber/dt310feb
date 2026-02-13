"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Calendar,
  BookOpen,
  CheckCircle2,
  Circle,
  PlayCircle,
  AlertCircle,
} from "lucide-react";
import { courseProgressDetails } from "@/data/progressData";

function getStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
          <CheckCircle2 className="w-3 h-3" />
          Completed
        </span>
      );
    case "in_progress":
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
          <PlayCircle className="w-3 h-3" />
          In Progress
        </span>
      );
    case "not_started":
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
          <Circle className="w-3 h-3" />
          Not Started
        </span>
      );
    default:
      return null;
  }
}

function getProgressBarColor(percentage: number) {
  if (percentage === 100) return "bg-emerald-500";
  if (percentage >= 50) return "bg-teal-500";
  if (percentage > 0) return "bg-amber-500";
  return "bg-slate-300";
}

export default function CourseBreakdown() {
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  const toggleCourse = (courseId: string) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Course Progress Breakdown</h2>
          <p className="text-sm text-slate-500 mt-1">
            Detailed progress for each enrolled course
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            Completed
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-teal-500" />
            In Progress
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-slate-300" />
            Not Started
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {courseProgressDetails.map((course) => (
          <div
            key={course.id}
            className="border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 transition"
          >
            {/* Course Header */}
            <div
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 transition"
              onClick={() => toggleCourse(course.id)}
            >
              <div className="flex-shrink-0">
                {expandedCourse === course.id ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-slate-800 truncate">{course.title}</h3>
                  {course.isMandatory && (
                    <span className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-medium">
                      Mandatory
                    </span>
                  )}
                  {getStatusBadge(course.status)}
                </div>
                <p className="text-sm text-slate-500">Instructor: {course.instructor}</p>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="font-semibold text-slate-800">{course.modulesCompleted}/{course.totalModules}</p>
                  <p className="text-xs text-slate-500">Modules</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-800">{course.timeSpent}</p>
                  <p className="text-xs text-slate-500">of {course.estimatedTime}</p>
                </div>
                <div className="w-32">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-slate-800">
                      {course.completionPercentage}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${getProgressBarColor(
                        course.completionPercentage
                      )}`}
                      style={{ width: `${course.completionPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {course.dueDate && (
                <div className="flex items-center gap-1 text-sm text-slate-500">
                  <Calendar className="w-4 h-4" />
                  <span>Due: {new Date(course.dueDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Expanded Module Details */}
            {expandedCourse === course.id && course.modules.length > 0 && (
              <div className="border-t border-slate-200 bg-slate-50 p-4">
                <h4 className="text-sm font-medium text-slate-700 mb-3">Module Progress</h4>
                <div className="space-y-2">
                  {course.modules.map((module, index) => (
                    <div
                      key={module.id}
                      className="flex items-center gap-3 bg-white rounded-lg p-3 border border-slate-100"
                    >
                      {/* Status Icon */}
                      <div className="flex-shrink-0">
                        {module.status === "completed" ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : module.status === "in_progress" ? (
                          <div className="relative">
                            <Circle className="w-5 h-5 text-teal-500" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                            </div>
                          </div>
                        ) : module.status === "locked" ? (
                          <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center">
                            <span className="text-xs text-slate-500">🔒</span>
                          </div>
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300" />
                        )}
                      </div>

                      {/* Module Info */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${
                            module.status === "locked"
                              ? "text-slate-400"
                              : "text-slate-700"
                          }`}
                        >
                          {index + 1}. {module.title}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                          <span className="capitalize">{module.type}</span>
                          {module.duration && <span>{module.duration}</span>}
                        </div>
                      </div>

                      {/* Video Progress */}
                      {module.type === "video" && module.watchProgress !== undefined && (
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-teal-500 rounded-full"
                              style={{ width: `${module.watchProgress}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">{module.watchProgress}%</span>
                        </div>
                      )}

                      {/* Completion Date */}
                      {module.completedAt && (
                        <span className="text-xs text-slate-400">
                          {new Date(module.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
