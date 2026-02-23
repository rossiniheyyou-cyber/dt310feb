"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Users, BookOpen, Calendar, User, Tag } from "lucide-react";
import { getCourse } from "@/lib/api/courses";
import apiClient from "@/lib/api/client";

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  status: string;
  tags: string[];
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AdminCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [enrollmentCount, setEnrollmentCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Fetch course details
        const courseData = await getCourse(courseId);
        setCourse(courseData);

        // Fetch enrollment count (for now using canonical store data, later can be from backend)
        // TODO: Add enrollment tracking endpoint in backend
        try {
          const enrollmentResponse = await apiClient.get(`/courses/${courseId}/enrollments`);
          setEnrollmentCount(enrollmentResponse.data?.count || 0);
        } catch {
          // If endpoint doesn't exist yet, use 0 or fetch from canonical store
          setEnrollmentCount(0);
        }
      } catch (err: any) {
        console.error("Failed to fetch course:", err);
        setError(err.response?.data?.message || "Failed to load course details");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition"
        >
          <ArrowLeft size={20} />
          Back to Courses
        </button>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
          {error || "Course not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition"
      >
        <ArrowLeft size={20} />
        Back to Courses
      </button>

      <div className="bg-white border border-slate-200/60 rounded-2xl p-8 shadow-soft card-flashy animated-bg">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-teal-700" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-1">{course.title}</h1>
                <span
                  className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold ${
                    course.status === "published"
                      ? "bg-emerald-100 text-emerald-700"
                      : course.status === "draft"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                </span>
              </div>
            </div>
            <p className="text-slate-600 text-lg leading-relaxed">{course.description || "No description provided."}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <div className="card-gradient border border-teal-200/60 rounded-xl p-6 hover-glow-intense card-interactive transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-teal-700" />
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Enrolled</h3>
            </div>
            <p className="text-3xl font-bold text-teal-700">{enrollmentCount}</p>
            <p className="text-xs text-slate-600 mt-1">Learners currently enrolled</p>
          </div>

          <div className="card-gradient border border-indigo-200/60 rounded-xl p-6 hover-glow-intense transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <Tag className="w-6 h-6 text-indigo-700" />
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Tags</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {course.tags.length > 0 ? (
                course.tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 text-sm">No tags</span>
              )}
            </div>
          </div>

          {course.createdBy && (
            <div className="card-gradient border border-slate-200/60 rounded-xl p-6 hover-glow-intense transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-6 h-6 text-slate-700" />
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Instructor</h3>
              </div>
              <p className="text-lg font-bold text-slate-900">{course.createdBy.name}</p>
              <p className="text-xs text-slate-600 mt-1">{course.createdBy.email}</p>
            </div>
          )}

          <div className="card-gradient border border-purple-200/60 rounded-xl p-6 hover-glow-intense transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6 text-purple-700" />
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Created</h3>
            </div>
            <p className="text-sm font-bold text-slate-900">
              {new Date(course.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Updated {new Date(course.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
