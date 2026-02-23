"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  BookOpen,
  ClipboardList,
  Award,
  TrendingUp,
  Calendar,
  Target,
} from "lucide-react";
import { getCurrentUser } from "@/lib/currentUser";
import {
  platformUsers,
  getLearnersForManager,
  getDepartmentById,
  getTeamById,
  issuedCertificates,
} from "@/data/adminData";
import { useCanonicalStore } from "@/context/CanonicalStoreContext";
import DashboardWelcome from "@/components/dashboard/DashboardWelcome";

export default function ManagerDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const user = getCurrentUser();

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Find manager by email, or create a fallback manager if user is a manager but not in mock data
  const manager = useMemo(() => {
    if (!user?.email) return null;
    
    // First try to find exact match
    const found = platformUsers.find((u) => u.role === "manager" && u.email === user.email);
    if (found) return found;
    
    // If user has manager role but not in mock data, create a fallback manager entry
    if (user.role === "manager") {
      // Use first available manager's structure as template, or create a basic one
      const firstManager = platformUsers.find((u) => u.role === "manager");
      if (firstManager) {
        return {
          ...firstManager,
          id: `mgr-${user.email.replace(/[^a-zA-Z0-9]/g, "-")}`,
          name: user.name || user.email.split("@")[0],
          email: user.email,
        };
      }
      // Fallback: create minimal manager entry
      return {
        id: `mgr-${user.email.replace(/[^a-zA-Z0-9]/g, "-")}`,
        name: user.name || user.email.split("@")[0],
        email: user.email,
        role: "manager" as const,
        status: "active" as const,
        departmentId: "dept-1",
        teamId: "team-1",
        managerId: null,
        enrolledCourseIds: [],
        assignedCourseIds: [],
        createdAt: new Date().toISOString().split("T")[0],
        lastActiveAt: new Date().toISOString(),
      };
    }
    
    return null;
  }, [user?.email, user?.role, user?.name]);
  
  const teamLearners = useMemo(() => {
    if (!manager) return [];
    // Try to get learners for this manager
    const learners = getLearnersForManager(manager.id);
    // If no learners found, show all learners as fallback (for demo purposes)
    if (learners.length === 0) {
      return platformUsers.filter((u) => u.role === "learner").slice(0, 5);
    }
    return learners;
  }, [manager]);
  const { state } = useCanonicalStore();
  const publishedCourses = state.courses.filter((c) => c.status === "published");
  const assignments = state.assignments;

  const teamCourseIds = useMemo(() => {
    const ids = new Set<string>();
    teamLearners.forEach((l) => l.enrolledCourseIds.forEach((id) => ids.add(id)));
    return Array.from(ids);
  }, [teamLearners]);

  const teamCourses = publishedCourses.filter((c) => teamCourseIds.includes(c.id));
  const teamCertificates = issuedCertificates.filter((c) =>
    teamLearners.some((l) => l.id === c.learnerId)
  );
  const completionRate =
    teamCourses.length > 0
      ? Math.round(
          teamCourses.reduce((a, c) => a + c.completionRate, 0) / teamCourses.length
        )
      : 0;
  const overdueCount = 0;

  const dept = manager?.departmentId ? getDepartmentById(manager.departmentId) : null;
  const team = manager?.teamId ? getTeamById(manager.teamId) : null;

  const kpiCards = [
    {
      label: "Team learners",
      value: teamLearners.length,
      icon: Users,
      href: "/dashboard/manager/learners",
    },
    {
      label: "Courses assigned to team",
      value: teamCourses.length,
      icon: BookOpen,
      href: "/dashboard/manager/courses",
    },
    {
      label: "Team completion rate",
      value: `${completionRate}%`,
      icon: TrendingUp,
      href: "/dashboard/manager/reports",
    },
    {
      label: "Overdue assignments",
      value: overdueCount,
      icon: ClipboardList,
      href: "/dashboard/manager/assessments",
    },
    {
      label: "Certificates earned by team",
      value: teamCertificates.length,
      icon: Award,
      href: "/dashboard/manager/reports",
    },
  ];

  return (
    <>
      <div className="space-y-8">
        <DashboardWelcome />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {kpiCards.map(({ label, value, icon: Icon, href }) => (
            <Link
              key={label}
              href={href}
              className="rounded-2xl card-gradient border border-slate-200 p-4 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300"
            >
              <Icon className="w-6 h-6 text-slate-600 mb-2" />
              <p className="text-2xl font-semibold text-slate-800" suppressHydrationWarning>
                {mounted ? value : "—"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl card-gradient border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="font-semibold text-slate-800">Team progress</h2>
              <p className="text-sm text-slate-500 mt-0.5">Course completion by team learners</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {teamCourses.slice(0, 5).map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-4">
                    <p className="text-sm font-medium text-slate-800 truncate flex-1">{c.title}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-500 rounded-full"
                          style={{ width: `${c.completionRate}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-600 w-8">{c.completionRate}%</span>
                    </div>
                  </div>
                ))}
                {teamCourses.length === 0 && (
                  <p className="text-sm text-slate-500">No courses assigned to your team yet.</p>
                )}
              </div>
              <Link
                href="/dashboard/manager/courses"
                className="inline-block mt-4 text-sm font-medium text-slate-600 hover:text-slate-800"
              >
                View course monitoring →
              </Link>
            </div>
          </div>

          <div className="rounded-2xl card-gradient border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="font-semibold text-slate-800">Upcoming deadlines</h2>
              <p className="text-sm text-slate-500 mt-0.5">Assignments and quizzes for your team</p>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {assignments.slice(0, 5).map((a) => (
                  <li key={a.id} className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="font-medium text-slate-800">{a.title}</p>
                      <p className="text-xs text-slate-500">Due {a.dueDate}</p>
                    </div>
                  </li>
                ))}
                {assignments.length === 0 && (
                  <p className="text-sm text-slate-500">No upcoming assignments.</p>
                )}
              </ul>
              <Link
                href="/dashboard/manager/assessments"
                className="inline-block mt-4 text-sm font-medium text-slate-600 hover:text-slate-800"
              >
                View assignments & quizzes →
              </Link>
            </div>
          </div>

          <div className="rounded-2xl card-gradient border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300 lg:col-span-2">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="font-semibold text-slate-800">Skill readiness overview</h2>
              <p className="text-sm text-slate-500 mt-0.5">Team learners by enrolled courses</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {teamLearners.slice(0, 8).map((l) => (
                  <div
                    key={l.id}
                    className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-semibold text-sm">
                      {l.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{l.name}</p>
                      <p className="text-xs text-slate-500">{l.enrolledCourseIds.length} courses</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/dashboard/manager/learners"
                className="inline-block mt-4 text-sm font-medium text-slate-600 hover:text-slate-800"
              >
                View all team learners →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
