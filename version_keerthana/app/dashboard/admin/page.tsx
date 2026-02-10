"use client";

import { useState, useEffect } from "react";
import { Users, BookOpen, ClipboardList, Award, TrendingUp, Activity, Settings } from "lucide-react";
import { useCanonicalStore } from "@/context/CanonicalStoreContext";
import {
  platformUsers,
  getUsersByRole,
} from "@/data/adminData";
import { getSystemActivity, getInstructorActivity } from "@/lib/api/activity";
import type { SystemActivityEntry, InstructorActivity } from "@/lib/api/activity";
import Link from "next/link";
import DashboardWelcome from "@/components/dashboard/DashboardWelcome";

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [systemActivity, setSystemActivity] = useState<SystemActivityEntry[]>([]);
  const [instructorActivity, setInstructorActivity] = useState<InstructorActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { state } = useCanonicalStore();

  useEffect(() => {
    setMounted(true);
  }, []);
  const courses = state.courses;
  const assignments = state.assignments;
  const published = courses.filter((c) => c.status === "published");
  const draft = courses.filter((c) => c.status === "draft");
  const archived = courses.filter((c) => c.status === "archived");
  const learners = getUsersByRole("learner");
  const instructors = getUsersByRole("instructor");
  const managers = getUsersByRole("manager");
  const admins = getUsersByRole("admin");
  const completionRate = published.length > 0 ? Math.round(published.reduce((a, c) => a + c.completionRate, 0) / published.length) : 0;
  const recentActivity = systemActivity.slice(0, 8);

  // Fetch real-time activity data
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        const [activityData, instructorData] = await Promise.all([
          getSystemActivity(20),
          getInstructorActivity(),
        ]);
        setSystemActivity(activityData.activities || []);
        setInstructorActivity(instructorData.instructors || []);
      } catch (err) {
        console.error("Failed to fetch activity:", err);
        // Fallback to empty arrays on error
        setSystemActivity([]);
        setInstructorActivity([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();

    // Set up polling for real-time updates (every 30 seconds)
    const interval = setInterval(fetchActivity, 30000);

    return () => clearInterval(interval);
  }, []);

  const kpiCards = [
    { label: "Total Learners", value: learners.length, icon: Users, href: "/dashboard/admin/users?role=learner" },
    { label: "Instructors", value: instructors.length, icon: Users, href: "/dashboard/admin/users?role=instructor" },
    { label: "Managers", value: managers.length, icon: Users, href: "/dashboard/admin/users?role=manager" },
    { label: "Admins", value: admins.length, icon: Users, href: "/dashboard/admin/users?role=admin" },
    { label: "Published Courses", value: published.length, icon: BookOpen, href: "/dashboard/admin/courses" },
    { label: "Draft / Archived", value: draft.length + archived.length, icon: BookOpen, href: "/dashboard/admin/courses" },
    { label: "Assignments & Quizzes", value: assignments.length, icon: ClipboardList, href: "/dashboard/admin/assessments" },
    { label: "Org Completion Rate", value: `${completionRate}%`, icon: TrendingUp, href: "/dashboard/admin/reports" },
  ];

  return (
    <>
      <div className="space-y-8">
        <DashboardWelcome />

        {/* Overview KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {kpiCards.map(({ label, value, icon: Icon, href }) => (
            <Link
              key={label}
              href={href}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition"
            >
              <Icon className="w-6 h-6 text-slate-600 mb-2" />
              <p className="text-2xl font-semibold text-slate-800" suppressHydrationWarning>
                {mounted ? value : "—"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </Link>
          ))}
        </div>

        {/* Widgets row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Course progress overview */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="font-semibold text-slate-800">Course Progress Overview</h2>
            <p className="text-sm text-slate-500 mt-0.5">Published courses and completion rates</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {published.slice(0, 5).map((c) => (
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
              {published.length === 0 && (
                <p className="text-sm text-slate-500">No published courses yet.</p>
              )}
            </div>
            <Link
              href="/dashboard/admin/courses"
              className="inline-block mt-4 text-sm font-medium text-slate-600 hover:text-slate-800"
            >
              View all courses →
            </Link>
          </div>
          </div>

          {/* Learner engagement (simplified) */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="font-semibold text-slate-800">Learner Engagement</h2>
            <p className="text-sm text-slate-500 mt-0.5">Active learners and enrollment</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-2xl font-semibold text-slate-800">{learners.length}</p>
                <p className="text-xs text-slate-500">Total learners</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-2xl font-semibold text-slate-800">
                  {learners.filter((l) => l.enrolledCourseIds.length > 0).length}
                </p>
                <p className="text-xs text-slate-500">Enrolled in courses</p>
              </div>
            </div>
            <Link
              href="/dashboard/admin/users?role=learner"
              className="inline-block mt-4 text-sm font-medium text-slate-600 hover:text-slate-800"
            >
              Manage learners →
            </Link>
          </div>
          </div>

          {/* Instructor activity summary */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="font-semibold text-slate-800">Instructor Activity</h2>
            <p className="text-sm text-slate-500 mt-0.5">Courses assigned to instructors</p>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
              </div>
            ) : instructorActivity.length > 0 ? (
              <>
                <ul className="space-y-3">
                  {instructorActivity.slice(0, 5).map((instructor) => (
                    <li key={instructor.id} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-800">{instructor.name}</span>
                      <span className="text-slate-500">{instructor.courseCount} {instructor.courseCount === 1 ? 'course' : 'courses'}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/dashboard/admin/users?role=instructor"
                  className="inline-block mt-4 text-sm font-medium text-slate-600 hover:text-slate-800"
                >
                  View instructors →
                </Link>
              </>
            ) : (
              <p className="text-sm text-slate-500">No instructor activity yet.</p>
            )}
          </div>
          </div>

          {/* Recent system activity */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-slate-800">Recent System Activity</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Platform events and actions</p>
                </div>
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
                )}
              </div>
            </div>
            <div className="p-6">
              {loading && recentActivity.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                </div>
              ) : recentActivity.length > 0 ? (
                <ul className="space-y-3">
                  {recentActivity.map((a) => (
                    <li key={a.id} className="flex gap-3 text-sm">
                      <Activity className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-slate-800">{a.description}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {new Date(a.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No recent activity.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
