"use client";

import Link from "next/link";
import { ChevronRight, CheckCircle2, Circle, Lock } from "lucide-react";
import type { LearningPath, Phase, Course } from "@/data/learningPaths";
import { useLearnerProgress } from "@/context/LearnerProgressContext";

interface AIRoadmapViewProps {
  path: LearningPath;
  personalizedMessage?: string;
}

function getCourseStatus(
  pathSlug: string,
  courseId: string,
  courseProgress: Record<string, { courseCompleted: boolean }>
): "completed" | "in_progress" | "locked" {
  const key = `${pathSlug}-${courseId}`;
  const entry = courseProgress[key];
  if (entry?.courseCompleted) return "completed";
  if (entry) return "in_progress";
  return "locked";
}

export default function AIRoadmapView({
  path,
  personalizedMessage,
}: AIRoadmapViewProps) {
  const { state } = useLearnerProgress();

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-gradient-to-br from-slate-50 to-white">
        <h2 className="text-xl font-semibold text-slate-800">
          {path.title} Roadmap
        </h2>
        <p className="text-sm text-slate-600 mt-1">{path.description}</p>
        {personalizedMessage && (
          <p className="text-sm text-teal-700 mt-3 italic">
            {personalizedMessage}
          </p>
        )}
      </div>

      {/* Roadmap - roadmap.sh style: vertical phases with horizontal course nodes */}
      <div className="p-6">
        <div className="space-y-10">
          {path.phases.map((phase: Phase, phaseIdx: number) => (
            <div key={phase.id || phaseIdx}>
              {/* Phase header */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  {phase.name}
                </span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Course nodes - horizontal flow with connectors */}
              <div className="relative pl-2">
                <div className="flex flex-wrap gap-3">
                  {phase.courses.map((course: Course, courseIdx: number) => {
                    const status = getCourseStatus(
                      path.slug,
                      course.id,
                      state.courseProgress
                    );
                    const href = `/dashboard/learner/courses/${path.slug}/${course.id}`;

                    return (
                      <div key={course.id} className="flex items-center gap-1">
                        <Link
                          href={status !== "locked" ? href : "#"}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition group ${
                            status === "completed"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-800 hover:border-emerald-300"
                              : status === "in_progress"
                              ? "bg-teal-50 border-teal-200 text-teal-800 hover:border-teal-300"
                              : "bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed"
                          }`}
                        >
                          {status === "completed" ? (
                            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                          ) : status === "in_progress" ? (
                            <Circle
                              size={18}
                              className="text-teal-500 fill-teal-100 flex-shrink-0"
                            />
                          ) : (
                            <Lock size={16} className="text-slate-400 flex-shrink-0" />
                          )}
                          <span className="font-medium text-sm">
                            {course.title}
                          </span>
                          {status !== "locked" && (
                            <ChevronRight
                              size={14}
                              className="text-slate-400 group-hover:text-teal-600 opacity-0 group-hover:opacity-100 transition"
                            />
                          )}
                        </Link>
                        {courseIdx < phase.courses.length - 1 && (
                          <div className="w-4 h-0.5 bg-slate-200 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-4 text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-emerald-600" />
          Completed
        </span>
        <span className="flex items-center gap-1.5">
          <Circle size={14} className="text-teal-500 fill-teal-100" />
          In Progress
        </span>
        <span className="flex items-center gap-1.5">
          <Lock size={12} className="text-slate-400" />
          Locked
        </span>
      </div>
    </div>
  );
}
