"use client";

import { useMemo } from "react";
import Link from "next/link";
import { BookOpen, TrendingUp, Users } from "lucide-react";
import { getCurrentUser } from "@/lib/currentUser";
import { platformUsers, getLearnersForManager } from "@/data/adminData";
import { useCanonicalStore } from "@/context/CanonicalStoreContext";

export default function ManagerCourseMonitoringPage() {
  const user = getCurrentUser();
  const manager = useMemo(
    () => (user?.email ? platformUsers.find((u) => u.role === "manager" && u.email === user.email) : null),
    [user?.email]
  );
  const teamLearners = useMemo(() => (manager ? getLearnersForManager(manager.id) : []), [manager]);
  const { state } = useCanonicalStore();
  const published = state.courses.filter((c) => c.status === "published");

  const teamCourseIds = useMemo(() => {
    const ids = new Set<string>();
    teamLearners.forEach((l) => l.enrolledCourseIds.forEach((id) => ids.add(id)));
    return Array.from(ids);
  }, [teamLearners]);

  const teamCourses = published.filter((c) => teamCourseIds.includes(c.id));
  const enrolledCount = (courseId: string) =>
    teamLearners.filter((l) => l.enrolledCourseIds.includes(courseId)).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Course Monitoring</h1>
        <p className="text-slate-500 mt-1">
          View courses assigned to your team. Monitor completion trends and identify learners falling behind. No content editing.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Course</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-slate-700">Team enrolled</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-slate-700">Completion rate</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Roles / Phase</th>
              </tr>
            </thead>
            <tbody>
              {teamCourses.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50">
                  <td className="py-4 px-4">
                    <p className="font-medium text-slate-800">{c.title}</p>
                    <p className="text-sm text-slate-500 line-clamp-1 max-w-[280px]">{c.description}</p>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                      <Users className="w-4 h-4" />
                      {enrolledCount(c.id)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${c.completionRate}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-600">{c.completionRate}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-600">
                    {c.roles.slice(0, 2).join(", ")} • {c.phase}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {teamCourses.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No courses are assigned to your team yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
