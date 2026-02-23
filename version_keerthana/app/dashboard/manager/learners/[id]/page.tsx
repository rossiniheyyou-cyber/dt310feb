"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, BookOpen, Award, ClipboardList } from "lucide-react";
import { getCurrentUser } from "@/lib/currentUser";
import {
  platformUsers,
  getLearnersForManager,
  getUserById,
  issuedCertificates,
} from "@/data/adminData";
import { useCanonicalStore } from "@/context/CanonicalStoreContext";

export default function ManagerLearnerProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const user = getCurrentUser();
  const manager = useMemo(
    () => (user?.email ? platformUsers.find((u) => u.role === "manager" && u.email === user.email) : null),
    [user?.email]
  );
  const teamLearnerIds = useMemo(
    () => (manager ? getLearnersForManager(manager.id).map((l) => l.id) : []),
    [manager]
  );
  const learner = getUserById(id);
  const { getCourseById } = useCanonicalStore();
  const isInTeam = learner && teamLearnerIds.includes(learner.id);

  const certs = learner ? issuedCertificates.filter((c) => c.learnerId === learner.id) : [];
  const enrolledCourses = learner
    ? learner.enrolledCourseIds
        .map((cid) => getCourseById(cid))
        .filter(Boolean) as { id: string; title: string; completionRate: number }[]
    : [];

  if (!learner || !isInTeam) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/manager/learners"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to team learners
        </Link>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center text-slate-700">
          <p>Learner not found or not in your team.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard/manager/learners"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-800"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to team learners
      </Link>

      <div className="rounded-2xl card-gradient border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-xl">
            {learner.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-800">{learner.name}</h1>
            <p className="text-slate-500">{learner.email}</p>
            <p className="text-xs text-slate-500 mt-1">Read-only profile — team learner</p>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Courses enrolled
            </h2>
            <ul className="space-y-2">
              {enrolledCourses.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-none">
                  <span className="text-slate-800">{c.title}</span>
                  <span className="text-sm text-slate-500">{c.completionRate}%</span>
                </li>
              ))}
              {enrolledCourses.length === 0 && (
                <p className="text-sm text-slate-500">No courses enrolled.</p>
              )}
            </ul>
          </div>
          <div>
            <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Certificates earned
            </h2>
            <ul className="space-y-2">
              {certs.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-none">
                  <span className="text-slate-800">{c.courseTitle}</span>
                  <span className="text-xs text-slate-500">{new Date(c.earnedAt).toLocaleDateString()}</span>
                </li>
              ))}
              {certs.length === 0 && (
                <p className="text-sm text-slate-500">No certificates yet.</p>
              )}
            </ul>
          </div>
        </div>
        <div className="px-6 pb-6">
          <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Assignment and quiz status
          </h2>
          <p className="text-sm text-slate-500">
            View assignment and quiz submissions from Assignments and Quizzes monitoring for your team.
          </p>
        </div>
      </div>
    </div>
  );
}
