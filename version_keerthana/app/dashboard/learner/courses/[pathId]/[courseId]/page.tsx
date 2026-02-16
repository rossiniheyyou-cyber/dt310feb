"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { BookOpen, Clock, Target, ChevronRight } from "lucide-react";
import { getPathBySlug } from "@/data/learningPaths";
import { toLearnerModules, COURSE_OVERVIEW_META, getCourseById as getCourseFromData } from "@/data/canonicalCourses";
import { CourseDetailClient } from "./CourseDetailClient";
import type { Module } from "@/data/learningPaths";
import { useCanonicalStore } from "@/context/CanonicalStoreContext";
import { enrollInCourseApi, getMyEnrollments } from "@/lib/api/enrollments";
import { addLocalEnrollment, isLocallyEnrolled } from "@/lib/localEnrollments";
import { useLearnerProgress } from "@/context/LearnerProgressContext";
import HappyLearningAnimation from "@/components/learner/HappyLearningAnimation";

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
  const [showHappyLearning, setShowHappyLearning] = useState(false);
  const [autoPlayFirst, setAutoPlayFirst] = useState(false);
  const { getCourseById } = useCanonicalStore();
  const { enrollInPath } = useLearnerProgress();
  const fromStore = getCourseById(courseId);
  const fromData = getCourseFromData(courseId);
  const baseCourse =
    fromStore?.modules?.length
      ? fromStore
      : fromData?.modules?.length
        ? fromData
        : fromStore ?? fromData;
  const canonicalCourse = baseCourse
    ? { ...baseCourse, backendId: fromStore?.backendId ?? baseCourse.backendId }
    : undefined;
  const path = pathId ? getPathBySlug(pathId) : canonicalCourse ? getPathBySlug(canonicalCourse.pathSlug) : null;

  const handleAnimationComplete = useCallback(() => {
    setShowHappyLearning(false);
  }, []);

  useEffect(() => {
    setMounted(true);
    const checkEnrollment = () => {
      const localEnrolled = isLocallyEnrolled(courseId);
      if (localEnrolled) {
        setIsEnrolled(true);
        setEnrollmentChecked(true);
        return;
      }
      getMyEnrollments()
        .then((res) => {
          const setIds = new Set((res.enrollments || []).map((e) => String(e.courseId)));
          const canonical = getCourseById(courseId);
          const isEnrolledIn =
            setIds.has(String(courseId)) ||
            (canonical?.backendId != null && setIds.has(String(canonical.backendId)));
          setIsEnrolled(isEnrolledIn);
        })
        .catch(() => setIsEnrolled(false))
        .finally(() => setEnrollmentChecked(true));
    };
    checkEnrollment();
  }, [courseId, getCourseById]);

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

  // Course preview / overview page — show details before enrollment (no direct access to content)
  if (mounted && enrollmentChecked && !isEnrolled) {
    const meta = COURSE_OVERVIEW_META[canonicalCourse.id];
    const outcomes = meta?.outcomes ?? [];
    const totalHours = meta?.totalHours ?? 0;
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center gap-2 text-sm text-slate-600">
            <Link href="/dashboard/learner/courses" className="hover:text-teal-600 transition">Courses</Link>
            <ChevronRight size={14} className="text-slate-400" />
            <Link href="/dashboard/learner/courses/available" className="hover:text-teal-600 transition">Available</Link>
            <ChevronRight size={14} className="text-slate-400" />
            <span className="text-slate-900 font-medium">{canonicalCourse.title}</span>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-teal-50/20 to-white p-8 shadow-sm">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{canonicalCourse.title}</h1>
            <p className="text-slate-600 mb-6">{canonicalCourse.description}</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {canonicalCourse.skills.map((skill) => (
                <span key={skill} className="text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-md">
                  {skill}
                </span>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <Clock className="w-8 h-8 text-teal-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Total time to complete</p>
                  <p className="text-xl font-bold text-slate-900">{totalHours} hours</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <BookOpen className="w-8 h-8 text-teal-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Duration</p>
                  <p className="text-lg font-bold text-slate-900">{canonicalCourse.estimatedDuration}</p>
                </div>
              </div>
            </div>
            {outcomes.length > 0 && (
              <div className="mb-8">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-3">
                  <Target className="w-5 h-5 text-teal-600" />
                  What you&apos;ll learn
                </h3>
                <ul className="space-y-2">
                  {outcomes.map((outcome, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-700">
                      <span className="text-teal-500 mt-0.5">✓</span>
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link href="/dashboard/learner/courses/available" className="px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-center font-medium">
                Back to Available Courses
              </Link>
              <button
                type="button"
                disabled={enrolling}
                onClick={async () => {
                  const backendId = canonicalCourse.backendId != null ? Number(canonicalCourse.backendId) : NaN;
                  const id = Number.isFinite(backendId) ? backendId : Number(canonicalCourse.id);
                  try {
                    setEnrolling(true);
                    if (Number.isFinite(id)) {
                      try {
                        await enrollInCourseApi(String(id));
                      } catch (err) {
                        addLocalEnrollment(courseId);
                        addLocalEnrollment(String(id));
                      }
                    } else {
                      addLocalEnrollment(courseId);
                    }
                    enrollInPath(path?.slug ?? "fullstack");
                    setIsEnrolled(true);
                    setAutoPlayFirst(true);
                    setShowHappyLearning(true);
                  } finally {
                    setEnrolling(false);
                  }
                }}
                className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-60 font-medium"
              >
                {enrolling ? "Enrolling..." : "Enroll in this course"}
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

  return (
    <>
      <HappyLearningAnimation isOpen={showHappyLearning} onComplete={handleAnimationComplete} />
      <CourseDetailClient path={path} course={course} autoPlayFirst={autoPlayFirst} />
    </>
  );
}
