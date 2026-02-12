"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  FileText,
} from "lucide-react";
import { instructorLearners } from "@/data/instructorData";
import { courseProgressDetails } from "@/data/progressData";
import { useCanonicalStore } from "@/context/CanonicalStoreContext";

export default function LearnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getAssignments } = useCanonicalStore();
  const assignments = getAssignments();
  const learner = instructorLearners.find((l) => l.id === params.id);

  if (!learner) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-slate-600 hover:text-slate-800">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <p className="text-slate-600">Learner not found</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "excelling":
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Excelling</span>;
      case "on_track":
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">On Track</span>;
      case "at_risk":
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">At Risk</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/dashboard/instructor/learners"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Learners
      </Link>

      {/* Learner Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center text-2xl font-bold text-teal-700">
              {learner.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">{learner.name}</h1>
              <p className="text-slate-500">{learner.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-slate-600">{learner.role}</span>
                {getStatusBadge(learner.status)}
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center p-4 rounded-lg bg-teal-50 border border-teal-200">
              <p className="text-2xl font-bold text-teal-700">{learner.readinessScore}%</p>
              <p className="text-xs text-teal-600">Readiness</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-indigo-50 border border-indigo-200">
              <p className="text-2xl font-bold text-indigo-700">
                {learner.completedCourses}/{learner.enrolledCourses}
              </p>
              <p className="text-xs text-indigo-600">Courses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Progress */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600" />
            Course Progress
          </h2>
          <Link
            href="#"
            className="text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            View all
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {courseProgressDetails.slice(0, 4).map((course) => (
            <div key={course.id} className="flex items-center justify-between p-4 hover:bg-slate-50">
              <div>
                <p className="font-medium text-slate-800">{course.title}</p>
                <p className="text-sm text-slate-500">
                  {course.modulesCompleted} / {course.totalModules} modules
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full"
                    style={{ width: `${course.completionPercentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-700 w-12">
                  {course.completionPercentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assignments */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Assignment Status
          </h2>
          <Link
            href="#"
            className="text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            View all
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {assignments.filter((a) => a.type !== "Quiz").slice(0, 5).map((a) => (
            <div key={a.id} className="flex items-center justify-between p-4 hover:bg-slate-50">
              <div>
                <p className="font-medium text-slate-800">{a.title}</p>
                <p className="text-sm text-slate-500">{a.course}</p>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                  a.status === "Reviewed"
                    ? "bg-emerald-100 text-emerald-700"
                    : a.status === "Submitted"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {a.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
