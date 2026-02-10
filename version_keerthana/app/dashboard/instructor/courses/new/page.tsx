"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { ROLES, PHASES } from "@/data/canonicalCourses";
import { useCanonicalStore } from "@/context/CanonicalStoreContext";
import { getCurrentUser } from "@/lib/currentUser";
import { createCourse } from "@/lib/api/courses";

const ROLE_TO_PATH_SLUG: Record<string, string> = {
  "Full Stack Developer": "fullstack",
  "UI / UX Designer": "uiux",
  "Data Analyst / Engineer": "data-analyst",
  "Cloud & DevOps Engineer": "cloud-devops",
  "QA Engineer": "qa",
  "Digital Marketing": "digital-marketing",
};

export default function NewCoursePage() {
  const router = useRouter();
  const { addCourse, getCoursesForInstructor } = useCanonicalStore();
  const existingCourses = getCoursesForInstructor();
  const allCourseIds = [...new Set(existingCourses.map((c) => c.id))];
  
  // Check user role - only instructor/admin can create courses
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const user = getCurrentUser();
    setUserRole(user?.role || null);
    
    // Redirect if not instructor/admin
    if (user && user.role !== "instructor" && user.role !== "admin") {
      // Don't redirect immediately - show message first
    }
  }, []);
  
  const isAuthorized = userRole === "instructor" || userRole === "admin";

  const [form, setForm] = useState({
    title: "",
    description: "",
    videoUrl: "",
    thumbnail: "",
    estimatedDuration: "2 weeks",
    status: "draft" as const,
    roles: [] as string[],
    phase: "Foundation",
    courseOrder: 1,
    isMandatory: false,
    prerequisiteCourseIds: [] as string[],
  });

  const toggleRole = (role: string) => {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const togglePrerequisite = (id: string) => {
    setForm((prev) => ({
      ...prev,
      prerequisiteCourseIds: prev.prerequisiteCourseIds.includes(id)
        ? prev.prerequisiteCourseIds.filter((c) => c !== id)
        : [...prev.prerequisiteCourseIds, id],
    }));
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Show permission error if not authorized
  if (mounted && !isAuthorized) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Link
          href="/dashboard/instructor/courses"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Link>
        
        <div className="bg-white border border-red-200 rounded-xl p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                Insufficient Permissions
              </h2>
              <p className="text-slate-600 mb-4">
                You need an <strong>instructor</strong> or <strong>admin</strong> account to create courses.
                Your current role is: <strong>{userRole || "unknown"}</strong>
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-slate-700 mb-2">To create courses, you can:</p>
                <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                  <li>Log in with an instructor account (e.g., <code className="bg-white px-1 rounded">instructor@example.com</code> / <code className="bg-white px-1 rounded">InstructorPass123!</code>)</li>
                  <li>Contact an administrator to update your role to "instructor"</li>
                  <li>Sign up with an email containing "instructor" or "teacher" to get instructor role automatically</li>
                </ul>
              </div>
              <button
                onClick={() => router.push("/dashboard/instructor/courses")}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition"
              >
                Go Back to Courses
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    
    setLoading(true);
    setError("");

    try {
      const user = getCurrentUser();
      const pathSlug = form.roles[0] ? ROLE_TO_PATH_SLUG[form.roles[0]] ?? "fullstack" : "fullstack";
      const today = new Date().toISOString().slice(0, 10);

      // Create course in backend API (Title, Description, Video Link)
      const backendCourse = await createCourse({
        title: form.title.trim(),
        description: form.description.trim() || "",
        videoUrl: form.videoUrl.trim() || undefined,
        status: "draft",
        tags: form.roles.length > 0 ? form.roles : ["General"], // Use roles as tags for now
      });

      // Use backend course ID for canonical store to keep them in sync
      const canonicalId = backendCourse.id;
      addCourse({
        id: canonicalId,
        backendId: backendCourse.id, // Store backend ID for future updates
        title: form.title.trim(),
        description: form.description.trim(),
        videoUrl: form.videoUrl.trim() || undefined,
        thumbnail: form.thumbnail.trim() || undefined,
        estimatedDuration: form.estimatedDuration.trim(),
        status: "draft",
        roles: form.roles,
        phase: form.phase,
        courseOrder: form.courseOrder,
        isMandatory: form.isMandatory,
        prerequisiteCourseIds: form.prerequisiteCourseIds,
        modules: [],
        instructor: { name: user?.name ?? "Instructor", role: "Tech Lead" },
        skills: [],
        pathSlug,
        lastUpdated: today,
        enrolledCount: 0,
        completionRate: 0,
        createdAt: today,
      });

      router.push("/dashboard/instructor/courses");
    } catch (err: any) {
      console.error("Course creation error:", err);
      
      if (err.response?.status === 403) {
        setError(
          "Insufficient permissions. You need an instructor or admin account to create courses. " +
          "Please contact an administrator to update your role, or log in with an instructor account."
        );
      } else {
        setError(
          err.response?.data?.message ||
          err.message ||
          "Failed to create course. Please try again."
        );
      }
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        href="/dashboard/instructor/courses"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-600"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Courses
      </Link>

      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Create Course</h1>
        <p className="text-slate-500 mt-1">
          One canonical course. Same content appears in Learner → My Courses when published.
        </p>
      </div>

      <form className="space-y-6 bg-white border border-slate-200 rounded-xl p-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="font-semibold text-slate-800">Basic Information</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Course Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., REST API Development"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Course description..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Video Link</label>
            <input
              type="url"
              value={form.videoUrl}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=... or any video URL"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <p className="text-xs text-slate-500 mt-1">Learners will play this link in the course viewer (ReactPlayer).</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Thumbnail URL</label>
              <input
                type="text"
                value={form.thumbnail}
                onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                placeholder="/image.png"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Duration</label>
              <input
                type="text"
                value={form.estimatedDuration}
                onChange={(e) => setForm({ ...form, estimatedDuration: e.target.value })}
                placeholder="e.g., 2 weeks"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Role & Phase */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h2 className="font-semibold text-slate-800">Learning Path</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Assign to Role(s)</label>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    form.roles.includes(role)
                      ? "bg-teal-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Learning Phase</label>
              <select
                value={form.phase}
                onChange={(e) => setForm({ ...form, phase: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {PHASES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Course Order (within path)</label>
              <input
                type="number"
                min={1}
                value={form.courseOrder}
                onChange={(e) => setForm({ ...form, courseOrder: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isMandatory}
                onChange={(e) => setForm({ ...form, isMandatory: e.target.checked })}
                className="rounded border-slate-300 text-teal-600"
              />
              <span className="text-sm font-medium text-slate-700">Mandatory course</span>
            </label>
          </div>
        </div>

        {/* Prerequisites */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h2 className="font-semibold text-slate-800">Prerequisite Courses</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select prerequisites (optional)</label>
            <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
              {existingCourses.slice(0, 20).map((c) => (
                <label key={c.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.prerequisiteCourseIds.includes(c.id)}
                    onChange={() => togglePrerequisite(c.id)}
                    className="rounded border-slate-300 text-teal-600"
                  />
                  <span className="text-sm text-slate-700">{c.title}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          {error && (
            <div className="col-span-2 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}
          <Link
            href="/dashboard/instructor/courses"
            className="px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Course..." : "Create Course (Draft)"}
          </button>
        </div>
      </form>
    </div>
  );
}
