"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Search, ChevronRight, BookOpen, Award, ClipboardCheck, Users } from "lucide-react";
import { getCurrentUser } from "@/lib/currentUser";
import {
  platformUsers,
  getLearnersForManager,
  getDepartmentById,
  getTeamById,
  issuedCertificates,
} from "@/data/adminData";
import { useCanonicalStore } from "@/context/CanonicalStoreContext";
import AddUserToTeamButton from "@/components/manager/AddUserToTeamButton";
import { getProgressForUser } from "@/lib/api/progress";

/** Fetches and displays lesson completion count for a user (SELECT COUNT(*) FROM user_progress WHERE user_id = ?). */
function LessonCompletionCount({ userId }: { userId: string }) {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    getProgressForUser(userId)
      .then((res) => { if (!cancelled) setCount(res.count); })
      .catch(() => { if (!cancelled) setCount(null); });
    return () => { cancelled = true; };
  }, [userId]);
  if (count === null) return <span className="text-slate-400">—</span>;
  return (
    <span className="inline-flex items-center gap-1">
      <ClipboardCheck className="w-4 h-4" />
      {count}
    </span>
  );
}

export default function ManagerTeamLearnersPage() {
  const user = getCurrentUser();
  const manager = useMemo(
    () => (user?.email ? platformUsers.find((u) => u.role === "manager" && u.email === user.email) : null),
    [user?.email]
  );
  const teamLearners = useMemo(() => (manager ? getLearnersForManager(manager.id) : []), [manager]);
  const { getCourseById } = useCanonicalStore();
  const [search, setSearch] = useState("");

  const filtered = teamLearners.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase())
  );

  const dept = manager?.departmentId ? getDepartmentById(manager.departmentId) : null;
  const team = manager?.teamId ? getTeamById(manager.teamId) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Team Learners</h1>
        <p className="text-slate-500 mt-1">
          View learners under your team. Access read-only profiles, courses, progress, and certificates.
        </p>
        {dept && team && (
          <p className="text-sm text-slate-600 mt-2">{dept.name} → {team.name}</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-slate-800 input-modern"
          />
        </div>
        <AddUserToTeamButton onUserAdded={() => window.location.reload()} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Learner</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-slate-700">Lessons completed</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-slate-700">Courses</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-slate-700">Certificates</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Last active</th>
                <th className="w-12 py-4 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => {
                const certs = issuedCertificates.filter((c) => c.learnerId === l.id);
                const courses = l.enrolledCourseIds.map((id) => getCourseById(id)).filter(Boolean);
                const avgProgress = courses.length
                  ? Math.round(courses.reduce((a: number, c) => a + (c?.completionRate ?? 0), 0) / courses.length)
                  : 0;
                return (
                  <tr key={l.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm">
                          {l.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{l.name}</p>
                          <p className="text-sm text-slate-500">{l.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-slate-600">
                      <LessonCompletionCount userId={l.id} />
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {l.enrolledCourseIds.length}
                      </span>
                      {courses.length > 0 && (
                        <span className="block text-xs text-slate-500 mt-0.5">~{avgProgress}% avg</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        {certs.length}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-600">
                      {new Date(l.lastActiveAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <Link
                        href={`/dashboard/manager/learners/${l.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        View profile
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No team learners match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
