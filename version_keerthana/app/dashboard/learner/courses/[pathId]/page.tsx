"use client";

import { getPathBySlug } from "@/data/learningPaths";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronRight, Clock, BookOpen } from "lucide-react";
import { PathProgressHeader } from "@/components/learner/PathProgressHeader";
import { useCanonicalStore } from "@/context/CanonicalStoreContext";

export default function LearningPathPage() {
  const params = useParams();
  const pathId = params.pathId as string;
  const { getPublishedCoursesForPath } = useCanonicalStore();
  const path = getPathBySlug(pathId);
  const publishedCourses = getPublishedCoursesForPath(pathId);

  if (!path) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-slate-600">Learning path not found</p>
      </div>
    );
  }

  const byPhase = publishedCourses.reduce<Record<string, typeof publishedCourses>>((acc, c) => {
    const phase = c.phase || "Other";
    if (!acc[phase]) acc[phase] = [];
    acc[phase].push(c);
    return acc;
  }, {});
  const phaseOrder = ["Foundation", "Intermediate", "Advanced", "Capstone", "Other"];
  const sortedPhases = Object.keys(byPhase).sort(
    (a, b) => phaseOrder.indexOf(a) - phaseOrder.indexOf(b) || a.localeCompare(b)
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard/learner/courses"
            className="text-sm text-slate-500 hover:text-teal-600 mb-4 inline-block"
          >
            ← Back to My Courses
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">
            {path.title}
          </h1>
          <p className="text-slate-600 text-sm mb-4">{path.description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {path.skills.map((skill) => (
              <span
                key={skill}
                className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded"
              >
                {skill}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {path.duration}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen size={14} />
              {publishedCourses.length} courses
            </span>
          </div>
          <PathProgressHeader path={path} />
        </div>

        <div className="space-y-8">
          {sortedPhases.map((phaseName, phaseIdx) => (
            <section key={phaseName}>
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                {phaseName}
              </h2>
              <div className="space-y-3">
                {byPhase[phaseName]
                  .sort((a, b) => a.courseOrder - b.courseOrder)
                  .map((course, courseIdx) => (
                    <Link
                      key={course.id}
                      href={`/dashboard/learner/courses/${path.slug}/${course.id}`}
                      className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-teal-200 hover:shadow-sm transition group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0 text-teal-600 font-semibold text-sm">
                          {phaseIdx * 10 + courseIdx + 1}
                        </div>
                        <div>
                          <h3 className="text-base font-medium text-slate-900 group-hover:text-teal-700">
                            {course.title}
                          </h3>
                          <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">
                            {course.description}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                            <span>{course.estimatedDuration}</span>
                            <span>{course.instructor.name}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight
                        size={20}
                        className="text-slate-400 group-hover:text-teal-600 transition flex-shrink-0"
                      />
                    </Link>
                  ))}
              </div>
            </section>
          ))}
        </div>

        {publishedCourses.length === 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
            <p className="text-slate-600">No published courses in this path yet.</p>
            <p className="text-sm text-slate-500 mt-1">Instructor will add courses here when they are published.</p>
          </div>
        )}
      </div>
    </div>
  );
}
