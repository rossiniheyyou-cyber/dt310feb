"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit2,
  Users,
  Archive,
  Trash2,
  MoreVertical,
  BarChart3,
  BookOpen,
  Loader2,
  FileText,
  HelpCircle,
} from "lucide-react";
import { ROLES, COURSE_STATUS } from "@/data/canonicalCourses";
import { useCanonicalStore } from "@/context/CanonicalStoreContext";
import { getInstructorMyCourses, getCourseSubmissionStats } from "@/lib/api/instructor";
import { getCourses } from "@/lib/api/courses";
import type { InstructorCourse } from "@/lib/api/instructor";

function getStatusBadge(status: string) {
  switch (status) {
    case "published":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
          Published
        </span>
      );
    case "draft":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
          Draft
        </span>
      );
    case "pending_approval":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          Pending Approval
        </span>
      );
    case "archived":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
          Archived
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
          {status}
        </span>
      );
  }
}

type TabId = "my-courses" | "available";

export default function InstructorCoursesPage() {
  const [activeTab, setActiveTab] = useState<TabId>("my-courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { getCoursesForInstructor, archiveCourse, deleteCourse, refresh } = useCanonicalStore();
  const canonicalCourses = getCoursesForInstructor();

  const [myCourses, setMyCourses] = useState<InstructorCourse[]>([]);
  const [myCoursesLoading, setMyCoursesLoading] = useState(true);
  const [availableCourses, setAvailableCourses] = useState<{ id: string; title: string; description: string; status: string }[]>([]);
  const [availableLoading, setAvailableLoading] = useState(false);

  const fetchMyCourses = useCallback(async () => {
    setMyCoursesLoading(true);
    try {
      const res = await getInstructorMyCourses();
      setMyCourses(res.items || []);
    } catch {
      setMyCourses([]);
    } finally {
      setMyCoursesLoading(false);
    }
  }, []);

  const fetchAvailableCourses = useCallback(async () => {
    setAvailableLoading(true);
    try {
      const res = await getCourses({ limit: 100, status: "published" });
      setAvailableCourses((res.items || []).map((c) => ({ id: c.id, title: c.title, description: c.description || "", status: c.status })));
    } catch {
      setAvailableCourses([]);
    } finally {
      setAvailableLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "my-courses") fetchMyCourses();
    else fetchAvailableCourses();
  }, [activeTab, fetchMyCourses, fetchAvailableCourses]);

  // Refetch My Courses when page becomes visible (e.g. after creating a draft)
  useEffect(() => {
    const onFocus = () => {
      if (activeTab === "my-courses") fetchMyCourses();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [activeTab, fetchMyCourses]);

  const courses = activeTab === "my-courses"
    ? myCourses.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        status: c.status,
        enrolledCount: c.enrolledCount,
        modules: [] as { id: string }[],
        completionRate: 0,
        lastUpdated: c.updatedAt?.split("T")[0] || "",
        backendId: c.id,
        roles: c.tags || [],
      }))
    : availableCourses.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        status: c.status,
        enrolledCount: 0,
        modules: [] as { id: string }[],
        completionRate: 0,
        lastUpdated: "",
        backendId: c.id,
        roles: [] as string[],
      }));

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || (c as { roles?: string[] }).roles?.includes(roleFilter);
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Courses</h1>
        <p className="text-slate-500 mt-1">
          {activeTab === "my-courses"
              ? "Your courses — including drafts. Add modules, quizzes, and assessments in the course editor."
              : "Browse all published courses on the platform."}
        </p>
      </div>
        <Link
          href="/dashboard/instructor/courses/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition"
        >
          <Plus className="w-5 h-5" />
          Create Course
        </Link>
      </div>

      {/* My Courses / Available Courses Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("my-courses")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
            activeTab === "my-courses"
              ? "bg-teal-600 text-white"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          My Courses
          {myCourses.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === "my-courses" ? "bg-teal-500" : "bg-slate-200"}`}>
              {myCourses.length}
            </span>
          )}
          {myCourses.filter((c) => c.status === "draft").length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-amber-200 text-amber-800" title={`${myCourses.filter((c) => c.status === "draft").length} draft(s)`}>
              {myCourses.filter((c) => c.status === "draft").length} draft
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("available")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
            activeTab === "available"
              ? "bg-teal-600 text-white"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Available Courses
        </button>
      </div>

      {/* Drafts banner when in My Courses */}
      {activeTab === "my-courses" && myCourses.filter((c) => c.status === "draft").length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-amber-700 font-medium">
            You have {myCourses.filter((c) => c.status === "draft").length} draft course(s) — click to edit and add modules, quizzes, and assessments.
          </span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">All Roles</option>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">All Status</option>
          {COURSE_STATUS.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Course List */}
      {(activeTab === "my-courses" && myCoursesLoading) || (activeTab === "available" && availableLoading) ? (
        <div className="flex items-center justify-center py-16 gap-2 text-slate-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          Loading courses…
        </div>
      ) : (
        <>
      <div className="rounded-2xl card-gradient border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Course</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Roles</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Status</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-slate-700">Modules</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-slate-700">Enrolled</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-slate-700">Completion</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Last Updated</th>
                <th className="w-16 py-4 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course) => (
                <tr
                  key={course.id}
                  className="border-b border-slate-100 last:border-none hover:bg-slate-50 transition"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                        {course.thumbnail ? (
                          <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-slate-400 text-lg font-medium">{course.title.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{course.title}</p>
                        <p className="text-sm text-slate-500 line-clamp-1 max-w-[200px]">{course.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {(course.roles || []).slice(0, 2).map((r) => (
                        <span key={r} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded truncate max-w-[80px]" title={r}>
                          {r.split(" ")[0]}
                        </span>
                      ))}
                      {(course.roles || []).length > 2 && (
                        <span className="text-xs text-slate-400">+{(course.roles || []).length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">{getStatusBadge(course.status)}</td>
                  <td className="py-4 px-4 text-center font-medium text-slate-800">{course.modules.length}</td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-medium text-slate-800">{course.enrolledCount}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-14 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-500 rounded-full"
                          style={{ width: `${course.completionRate}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-600 w-10">{course.completionRate}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-500">{course.lastUpdated}</td>
                  <td className="py-4 px-4">
                    <div className="relative flex items-center justify-end gap-1">
                      <Link
                        href={`/dashboard/instructor/courses/${course.id}`}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/dashboard/instructor/learners?course=${course.id}`}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700"
                        title="View Learner Progress"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setOpenMenuId(openMenuId === course.id ? null : course.id)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenuId === course.id && (
                        <div className="absolute right-0 top-full mt-1 py-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-[140px]">
                          <Link
                            href={`/dashboard/instructor/courses/${course.id}`}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit Course
                          </Link>
                      <Link
                        href={`/dashboard/instructor/courses/${course.id}?tab=learners`}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Users className="w-4 h-4" />
                        View Learners
                      </Link>
                      <Link
                        href={`/dashboard/instructor/courses/${course.id}?tab=submissions`}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <FileText className="w-4 h-4" />
                        Quizzes & Assessments
                      </Link>
                          {activeTab === "my-courses" && (
                            <>
                              <button
                                onClick={() => {
                                  archiveCourse(course.id);
                                  setOpenMenuId(null);
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full text-left"
                              >
                                <Archive className="w-4 h-4" />
                                Archive Course
                              </button>
                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setDeleteConfirmId(course.id);
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete Course
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredCourses.length === 0 && !myCoursesLoading && !availableLoading && (
        <div className="rounded-2xl card-gradient border border-slate-200 p-12 text-center shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
          <p className="text-slate-600 font-medium">
            {activeTab === "my-courses" ? "You haven't created any courses yet" : "No courses match your filters"}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            {activeTab === "my-courses" ? "Create a new course to get started" : "Adjust your filters or check back later"}
          </p>
          {activeTab === "my-courses" && (
            <Link href="/dashboard/instructor/courses/new" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              <Plus className="w-5 h-5" />
              Create Course
            </Link>
          )}
        </div>
      )}
        </>
      )}

      {/* Close dropdown on click outside */}
      {openMenuId && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setOpenMenuId(null)}
          aria-hidden="true"
        />
      )}

      {/* Delete confirmation modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-800">Delete course?</h3>
            <p className="text-slate-600 mt-2 text-sm">
              This will remove the course permanently. Learners will no longer see it. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteCourse(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
