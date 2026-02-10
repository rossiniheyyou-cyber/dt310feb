"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getPathBySlug } from "@/data/learningPaths";
import { toLearnerModules } from "@/data/canonicalCourses";
import { CourseDetailClient } from "./CourseDetailClient";
import type { Module } from "@/data/learningPaths";
import { useCanonicalStore } from "@/context/CanonicalStoreContext";
import { enrollInCourseApi, getMyEnrollments } from "@/lib/api/enrollments";

function getDefaultModules(courseTitle: string): Module[] {
  return [
    { id: "m1", title: "Introduction", type: "video", duration: "15 min", completed: false },
    { id: "m2", title: "Core Concepts", type: "video", duration: "25 min", completed: false, locked: true },
    { id: "m3", title: "Deep Dive", type: "video", duration: "30 min", completed: false, locked: true },
    { id: "m4", title: "Practice Assignment", type: "assignment", duration: "45 min", completed: false, locked: true },
    { id: "m5", title: "Module Quiz", type: "quiz", duration: "10 min", completed: false, locked: true },
  ];
}

export default function CourseDetailPage() {
  const params = useParams();
  const pathId = params.pathId as string;
  const courseId = params.courseId as string;
  const [mounted, setMounted] = useState(false);
  const [enrollmentChecked, setEnrollmentChecked] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const { getCourseById } = useCanonicalStore();
  const canonicalCourse = getCourseById(courseId);
  const path = pathId ? getPathBySlug(pathId) : canonicalCourse ? getPathBySlug(canonicalCourse.pathSlug) : null;

  useEffect(() => {
    setMounted(true);
    getMyEnrollments()
      .then((res) => {
        const setIds = new Set((res.enrollments || []).map((e) => String(e.courseId)));
        setIsEnrolled(setIds.has(String(courseId)));
      })
      .catch(() => setIsEnrolled(false))
      .finally(() => setEnrollmentChecked(true));
  }, []);

  // Same root structure on server and first client to avoid hydration mismatch
  // (store may be empty on server / first paint, then populated after sync)
  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4" />
        <div className="flex-1 flex items-center justify-center p-8">
          <p className="text-slate-500 text-sm">Loading course…</p>
        </div>
      </div>
    );
  }

  if (!path) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-600">Path not found</p>
        </div>
      </div>
    );
  }

  if (!canonicalCourse) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-600">Course not found</p>
        </div>
      </div>
    );
  }

  if (canonicalCourse.status !== "published" && canonicalCourse.status !== "archived") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-600">This course is not yet published.</p>
        </div>
      </div>
    );
  }

  // Restrict published course access to enrolled learners only (backend-backed enrollment).
  if (mounted && enrollmentChecked && !isEnrolled) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md text-center">
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">Enroll to access this course</h2>
            <p className="text-slate-600 mb-6">
              This course is published, but only enrolled learners can access course content, assignments, and quizzes.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/dashboard/learner/courses/available"
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Back to Available Courses
              </Link>
              <button
                type="button"
                disabled={enrolling}
                onClick={async () => {
                  const id = Number(canonicalCourse.backendId ?? canonicalCourse.id);
                  if (!Number.isFinite(id)) return;
                  try {
                    setEnrolling(true);
                    await enrollInCourseApi(String(id));
                    setIsEnrolled(true);
                  } finally {
                    setEnrolling(false);
                  }
                }}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-60"
              >
                {enrolling ? "Enrolling..." : "Enroll now"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const modules = toLearnerModules(canonicalCourse.modules);
  const course = {
    id: canonicalCourse.id,
    title: canonicalCourse.title,
    description: canonicalCourse.description,
    videoUrl: canonicalCourse.videoUrl,
    duration: canonicalCourse.estimatedDuration,
    instructor: canonicalCourse.instructor,
    skills: canonicalCourse.skills,
    modules: modules.length > 0 ? modules : getDefaultModules(canonicalCourse.title),
    backendId: canonicalCourse.backendId != null ? Number(canonicalCourse.backendId) : undefined,
  };

  return <CourseDetailClient path={path} course={course} />;
}
