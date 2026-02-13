"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, BookOpen, Eye, Trash2, AlertCircle, X } from "lucide-react";
import { useCanonicalStore } from "@/context/CanonicalStoreContext";
import { removeCourse } from "@/lib/api/courseRequests";

export default function AdminCoursesPage() {
  const { getCoursesForInstructor } = useCanonicalStore();
  const [mounted, setMounted] = useState(false);
  const courses = getCoursesForInstructor();
  
  useEffect(() => {
    setMounted(true);
  }, []);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showRemoveModal, setShowRemoveModal] = useState<{ courseId: string; courseTitle: string } | null>(null);
  const [removeReason, setRemoveReason] = useState("");
  const [removing, setRemoving] = useState(false);

  const filtered = courses.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Course & Learning Path Oversight</h1>
        <p className="text-slate-500 mt-1">
          View all courses created by instructors. Monitor structure, modules, and assign to departments or company-wide.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-slate-800"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700"
        >
          <option value="all">All status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-white via-teal-50/20 to-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Course</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Roles / Phase</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Status</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-slate-700">Modules</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-slate-700">Enrolled</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-slate-700">Completion</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Instructor</th>
                <th className="w-12 py-4 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50">
                  <td className="py-4 px-4">
                    <p className="font-medium text-slate-800" suppressHydrationWarning>{mounted ? c.title : ""}</p>
                    <p className="text-sm text-slate-500 line-clamp-1 max-w-[200px]" suppressHydrationWarning>{mounted ? c.description : ""}</p>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-600" suppressHydrationWarning>
                    {mounted ? `${c.roles.slice(0, 2).join(", ")} • ${c.phase}` : ""}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        c.status === "published" ? "bg-emerald-100 text-emerald-700" : c.status === "draft" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center text-slate-600">{c.modules.length}</td>
                  <td className="py-4 px-4 text-center text-slate-600">{c.enrolledCount}</td>
                  <td className="py-4 px-4 text-center text-slate-600">{c.completionRate}%</td>
                  <td className="py-4 px-4 text-sm text-slate-600">{c.instructor.name}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/admin/courses/${c.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700 transition"
                        suppressHydrationWarning
                      >
                        {mounted && <Eye className="w-4 h-4" />}
                        View
                      </Link>
                      <button
                        onClick={() => setShowRemoveModal({ courseId: c.id, courseTitle: c.title })}
                        className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl bg-gradient-to-br from-white via-teal-50/20 to-white border border-slate-200 p-12 text-center text-slate-500 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
          No courses match your filters.
        </div>
      )}

      {/* Remove Course Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 card-flashy">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Remove Course</h3>
              </div>
              <button
                onClick={() => {
                  setShowRemoveModal(null);
                  setRemoveReason("");
                }}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-700 mb-1">Course:</p>
                <p className="text-slate-900 font-semibold">{showRemoveModal.courseTitle}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Reason for Removal <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={removeReason}
                  onChange={(e) => setRemoveReason(e.target.value)}
                  placeholder="Please provide a detailed reason for removing this course (minimum 10 characters)..."
                  rows={5}
                  className="input-modern w-full resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {removeReason.length}/10 characters minimum
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setShowRemoveModal(null);
                    setRemoveReason("");
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!removeReason.trim() || removeReason.trim().length < 10) {
                      alert("Please provide a reason (at least 10 characters)");
                      return;
                    }

                    try {
                      setRemoving(true);
                      await removeCourse(showRemoveModal.courseId, removeReason.trim());
                      setShowRemoveModal(null);
                      setRemoveReason("");
                      alert("Course removed successfully");
                      // Refresh page or update course list
                      window.location.reload();
                    } catch (err: any) {
                      console.error("Failed to remove course:", err);
                      alert(err.response?.data?.message || "Failed to remove course");
                    } finally {
                      setRemoving(false);
                    }
                  }}
                  disabled={!removeReason.trim() || removeReason.trim().length < 10 || removing}
                  className="btn-fun px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {removing ? "Removing..." : "Remove Course"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
