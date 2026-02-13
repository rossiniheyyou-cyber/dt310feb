"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  GripVertical,
  Plus,
  Trash2,
  Video,
  FileText,
  Link as LinkIcon,
  Eye,
  EyeOff,
  Users,
  BarChart3,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import {
  toLearnerModules,
  CONTENT_TYPES,
  type CanonicalModule,
  type ContentItem,
  type ContentType,
} from "@/data/canonicalCourses";
import { useCanonicalStore } from "@/context/CanonicalStoreContext";
import { updateCourse as updateCourseAPI } from "@/lib/api/courses";
import { listQuizzesByCourse, createQuiz, type QuizSummary } from "@/lib/api/quizzes";
import { createCourse } from "@/lib/api/courses";

function getContentIcon(type: ContentType) {
  switch (type) {
    case "video":
      return Video;
    case "pdf":
    case "ppt":
      return FileText;
    case "link":
      return LinkIcon;
    default:
      return FileText;
  }
}

export default function InstructorCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { getCourseById, updateCourse, setCourseModules, publishCourse, getAvailableAssessments, refresh: refreshCanonical } = useCanonicalStore();
  const course = getCourseById(courseId);
  const [modules, setModules] = useState<CanonicalModule[]>(course?.modules ?? []);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(modules[0]?.id ?? null);
  const [draggedModuleId, setDraggedModuleId] = useState<string | null>(null);
  const [draggedContentId, setDraggedContentId] = useState<string | null>(null);

  useEffect(() => {
    if (course) setModules([...course.modules]);
  }, [courseId]);

  const backendId = course?.backendId != null ? Number(course.backendId) : null;
  useEffect(() => {
    if (backendId == null) return;
    let cancelled = false;
    setQuizzesLoading(true);
    listQuizzesByCourse(backendId)
      .then((res) => { if (!cancelled) setQuizzes(res.quizzes || []); })
      .catch(() => { if (!cancelled) setQuizzes([]); })
      .finally(() => { if (!cancelled) setQuizzesLoading(false); });
    return () => { cancelled = true; };
  }, [backendId]);

  if (!course) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/instructor/courses" className="text-teal-600 hover:underline">
          ← Back to Courses
        </Link>
        <p className="text-slate-600">Course not found</p>
      </div>
    );
  }

  const handleModuleReorder = (fromIndex: number, toIndex: number) => {
    const next = [...modules];
    const [removed] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, { ...removed, order: toIndex });
    setModules(next.map((m, i) => ({ ...m, order: i })));
  };

  const handleContentReorder = (moduleId: string, fromIndex: number, toIndex: number) => {
    setModules((prev) =>
      prev.map((mod) => {
        if (mod.id !== moduleId) return mod;
        const ch = [...mod.chapters];
        const [removed] = ch.splice(fromIndex, 1);
        ch.splice(toIndex, 0, { ...removed, order: toIndex });
        return { ...mod, chapters: ch.map((c, i) => ({ ...c, order: i })) };
      })
    );
  };

  const addModule = () => {
    const newMod: CanonicalModule = {
      id: `m${Date.now()}`,
      title: "New Module",
      order: modules.length,
      chapters: [],
      completionRules: [{ type: "watch_videos" }],
    };
    setModules([...modules, newMod]);
    setExpandedModuleId(newMod.id);
  };

  const addChapter = (moduleId: string) => {
    setModules((prev) =>
      prev.map((mod) => {
        if (mod.id !== moduleId) return mod;
        const newCh: ContentItem = {
          id: `c${Date.now()}`,
          type: "video",
          title: "New content",
          url: "",
          published: false,
          order: mod.chapters.length,
        };
        return { ...mod, chapters: [...mod.chapters, newCh] };
      })
    );
  };

  const updateModuleTitle = (moduleId: string, title: string) => {
    setModules((prev) =>
      prev.map((m) => (m.id === moduleId ? { ...m, title } : m))
    );
  };

  const updateChapter = (
    moduleId: string,
    chapterId: string,
    updates: Partial<ContentItem>
  ) => {
    setModules((prev) =>
      prev.map((mod) => {
        if (mod.id !== moduleId) return mod;
        return {
          ...mod,
          chapters: mod.chapters.map((c) =>
            c.id === chapterId ? { ...c, ...updates } : c
          ),
        };
      })
    );
  };

  const deleteChapter = (moduleId: string, chapterId: string) => {
    setModules((prev) =>
      prev.map((mod) => {
        if (mod.id !== moduleId) return mod;
        return {
          ...mod,
          chapters: mod.chapters.filter((c) => c.id !== chapterId),
        };
      })
    );
  };

  const toggleChapterPublished = (moduleId: string, chapterId: string) => {
    setModules((prev) =>
      prev.map((mod) => {
        if (mod.id !== moduleId) return mod;
        return {
          ...mod,
          chapters: mod.chapters.map((c) =>
            c.id === chapterId ? { ...c, published: !c.published } : c
          ),
        };
      })
    );
  };

  const assessments = getAvailableAssessments();
  const learnerModules = toLearnerModules(modules);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [createQuizLoading, setCreateQuizLoading] = useState(false);
  const [createQuizError, setCreateQuizError] = useState("");
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncError, setSyncError] = useState("");

  const handleSave = async () => {
    setCourseModules(courseId, modules);
    updateCourse(courseId, {});
    
    // Sync to backend if course exists in backend
    if (course && course.id) {
      try {
        setLoading(true);
        await updateCourseAPI(course.id, {
          title: course.title,
          description: course.description,
          videoUrl: course.videoUrl || undefined,
          status: course.status,
          tags: course.roles.length > 0 ? course.roles : ["General"],
        });
      } catch (err: any) {
        console.error("Failed to sync course to backend:", err);
        // Don't show error for save, just log it
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePublish = async () => {
    if (!course) return;
    
    setLoading(true);
    setError("");

    try {
      // Update canonical store modules first (safe to do before backend)
      setCourseModules(courseId, modules);

      // Sync to backend API - use backendId if available, otherwise try courseId, then create new
      // Instructors can publish directly (no admin approval gate)
      const backendId = course.backendId || courseId;
      
      console.log("📤 Publishing course:");
      console.log("  - Frontend ID:", courseId);
      console.log("  - Backend ID:", backendId);
      console.log("  - Course has backendId:", !!course.backendId);
      console.log("  - Course title:", course.title);
      console.log("  - Current status:", course.status);
      
      try {
        console.log("🔄 Attempting to update course with ID:", backendId);
        console.log("  - Update payload:", {
          title: course.title,
          description: course.description,
          status: "published",
          tags: course.roles.length > 0 ? course.roles : ["General"],
        });
        
        const updatedCourse = await updateCourseAPI(backendId, {
          title: course.title,
          description: course.description,
          videoUrl: course.videoUrl || undefined,
          status: "published",
          tags: course.roles.length > 0 ? course.roles : ["General"],
        });
        
        console.log("✅ Course updated successfully!");
        console.log("  - Updated course ID:", updatedCourse.id);
        console.log("  - Updated course status:", updatedCourse.status);
        
        // Update canonical store with backend ID if not already set
        if (updatedCourse.id && !course.backendId) {
          updateCourse(courseId, { backendId: updatedCourse.id });
        }
        
        // Update canonical store (only after backend publish succeeds)
        if (updatedCourse.id && !course.backendId) {
          updateCourse(courseId, { backendId: updatedCourse.id });
        }
        publishCourse(courseId);
        updateCourse(courseId, { status: "published", backendId: updatedCourse.id });
      } catch (apiErr: any) {
        console.log("❌ Update failed:");
        console.log("  - Status:", apiErr.response?.status);
        console.log("  - Error data:", apiErr.response?.data);
        console.log("  - Error message:", apiErr.message);
        
        // If course doesn't exist in backend yet, try to create it
        if (apiErr.response?.status === 404 || apiErr.response?.status === 400) {
          console.log("📝 Course not found in backend, creating new course with published status...");
          try {
            const { createCourse } = await import("@/lib/api/courses");
            const newCourse = await createCourse({
              title: course.title,
              description: course.description,
              videoUrl: course.videoUrl || undefined,
              status: "published",
              tags: course.roles.length > 0 ? course.roles : ["General"],
            });
            console.log("✅ Course created successfully!");
            console.log("  - New course ID:", newCourse.id);
            console.log("  - New course status:", newCourse.status);
            
            // Update the canonical store with the backend ID
            if (newCourse.id) {
              updateCourse(courseId, { backendId: newCourse.id });
              publishCourse(courseId);
              updateCourse(courseId, { status: "published", backendId: newCourse.id });
            }
          } catch (createErr: any) {
            console.error("❌ Failed to create course:");
            console.error("  - Status:", createErr.response?.status);
            console.error("  - Error:", createErr.response?.data || createErr.message);
            throw createErr;
          }
        } else {
          console.error("❌ Failed to sync course to backend:", apiErr);
          throw apiErr;
        }
      }

      // Show success message
      alert("Course published! Learners will see it in their dashboard.");
      
      // Refresh the page to show updated status
      router.refresh();
    } catch (err: any) {
      console.error("Publish error:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to publish course. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/instructor/courses"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-600"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Courses
      </Link>

      {/* Course Header */}
      <div className="rounded-2xl bg-gradient-to-br from-white via-teal-50/20 to-white border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden shrink-0">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-slate-400">
                  {course.title.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">{course.title}</h1>
              <p className="text-slate-500 mt-1">{course.description}</p>
              {course.videoUrl && (
                <p className="text-sm text-slate-600 mt-1">
                  Video: <a href={course.videoUrl} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline truncate block max-w-md">{course.videoUrl}</a>
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    course.status === "published"
                      ? "bg-emerald-100 text-emerald-700"
                      : course.status === "draft"
                      ? "bg-amber-100 text-amber-700"
                      : course.status === "pending_approval"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {course.status}
                </span>
                <span className="text-sm text-slate-500">
                  {course.roles.join(", ")} • {course.phase}
                </span>
              </div>
              {/* Debug Info */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-3 p-2 bg-slate-50 rounded text-xs text-slate-600">
                  <div>Frontend ID: {courseId}</div>
                  <div>Backend ID: {course.backendId || 'Not set'}</div>
                  <div>Status: {course.status}</div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-red-700 text-xs max-w-xs">
                {error}
              </div>
            )}
            <button
              onClick={course.status === "draft" ? handlePublish : handleSave}
              disabled={loading}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? course.status === "draft"
                  ? "Publishing..."
                  : "Saving..."
                : course.status === "draft"
                ? "Publish"
                : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Instructor Insights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
            <Users className="w-5 h-5 text-teal-600" />
            <div>
              <p className="text-2xl font-bold text-slate-800">{course.enrolledCount}</p>
              <p className="text-xs text-slate-500">Enrolled Learners</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
            <BarChart3 className="w-5 h-5 text-teal-600" />
            <div>
              <p className="text-2xl font-bold text-slate-800">{course.completionRate}%</p>
              <p className="text-xs text-slate-500">Completion Rate</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
            <div className="w-5 h-5 rounded bg-teal-100 flex items-center justify-center">
              <span className="text-xs font-bold text-teal-700">{modules.length}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{modules.length}</p>
              <p className="text-xs text-slate-500">Modules</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
            <div className="w-5 h-5 rounded bg-teal-100 flex items-center justify-center">
              <span className="text-xs font-bold text-teal-700">{learnerModules.length}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{learnerModules.length}</p>
              <p className="text-xs text-slate-500">Chapters for Learner</p>
            </div>
          </div>
        </div>

        {/* Quizzes for this course (auto-graded by AI) */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-2">
            <HelpCircle size={20} className="text-teal-600" />
            Quizzes for learners
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Create quizzes assigned to this course. All are auto-graded. Learners see them on the course page.
          </p>
          {backendId == null ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-800 mb-3">
                This course is not yet synced with the backend. Sync once to get a Backend ID—then you can create quizzes for learners (all auto-graded).
              </p>
              {syncError && (
                <p className="text-sm text-red-600 mb-3">{syncError}</p>
              )}
              <button
                type="button"
                disabled={syncLoading}
                onClick={async () => {
                  if (!course) return;
                  setSyncError("");
                  setSyncLoading(true);
                  try {
                    const newCourse = await createCourse({
                      title: course.title,
                      description: course.description,
                      videoUrl: course.videoUrl || undefined,
                      status: course.status === "published" ? "published" : "draft",
                      tags: course.roles?.length ? course.roles : ["General"],
                    });
                    if (newCourse?.id != null) {
                      updateCourse(courseId, { backendId: newCourse.id });
                      setSyncError("");
                      refreshCanonical();
                    }
                  } catch (err: unknown) {
                    const e = err as { response?: { data?: { message?: string } }; message?: string };
                    setSyncError(e.response?.data?.message || e.message || "Sync failed");
                  } finally {
                    setSyncLoading(false);
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 text-sm font-medium"
              >
                {syncLoading ? <Loader2 size={18} className="animate-spin" /> : null}
                Sync with backend
              </button>
            </div>
          ) : quizzesLoading ? (
            <div className="flex items-center gap-2 text-slate-500 text-sm py-2">
              <Loader2 size={18} className="animate-spin" />
              Loading quizzes…
            </div>
          ) : (
            <>
              <ul className="space-y-2 mb-4">
                {quizzes.map((q) => (
                  <li
                    key={q.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50"
                  >
                    <span className="font-medium text-slate-800">{q.title}</span>
                    <span className="text-xs text-slate-500">
                      Created {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : ""}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => { setShowCreateQuiz(true); setNewQuizTitle(""); setCreateQuizError(""); }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium"
              >
                <Plus size={18} />
                Create quiz
              </button>
            </>
          )}
        </div>
      </div>

      {/* Create Quiz Modal (Generate with AI) */}
      {showCreateQuiz && backendId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Create quiz</h3>
              <button onClick={() => setShowCreateQuiz(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              AI will generate 10 MCQs based on this course. All quizzes are auto-graded.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Quiz title</label>
              <input
                type="text"
                value={newQuizTitle}
                onChange={(e) => setNewQuizTitle(e.target.value)}
                placeholder="e.g. Week 1 Check"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            {createQuizError && (
              <p className="text-sm text-red-600 mb-4">{createQuizError}</p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCreateQuiz(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!newQuizTitle.trim() || createQuizLoading}
                onClick={async () => {
                  setCreateQuizError("");
                  setCreateQuizLoading(true);
                  try {
                    await createQuiz(backendId, { title: newQuizTitle.trim(), generateWithAi: true });
                    setShowCreateQuiz(false);
                    setNewQuizTitle("");
                    listQuizzesByCourse(backendId).then((res) => setQuizzes(res.quizzes || []));
                  } catch (err: unknown) {
                    const e = err as { response?: { data?: { message?: string } } };
                    setCreateQuizError(e.response?.data?.message || "Failed to create quiz");
                  } finally {
                    setCreateQuizLoading(false);
                  }
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
              >
                {createQuizLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                Generate with AI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Module & Chapter Management */}
      <div className="rounded-2xl bg-gradient-to-br from-white via-teal-50/20 to-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">Modules & Chapters</h2>
            <p className="text-sm text-slate-500 mt-1">
              Drag to reorder. Add content per module. Control publish/unpublish per item.
            </p>
          </div>
          <button
            onClick={addModule}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Module
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {modules
            .sort((a, b) => a.order - b.order)
            .map((mod, modIndex) => {
              const isExpanded = expandedModuleId === mod.id;

              return (
                <div key={mod.id} className="group">
                  {/* Module Header - Draggable */}
                  <div
                    draggable
                    onDragStart={() => setDraggedModuleId(mod.id)}
                    onDragEnd={() => setDraggedModuleId(null)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (draggedModuleId && draggedModuleId !== mod.id) {
                        const fromIdx = modules.findIndex((m) => m.id === draggedModuleId);
                        if (fromIdx >= 0) handleModuleReorder(fromIdx, modIndex);
                      }
                    }}
                    className={`flex items-center gap-2 p-4 hover:bg-slate-50 transition cursor-grab ${
                      draggedModuleId === mod.id ? "opacity-50" : ""
                    }`}
                  >
                    <GripVertical className="w-5 h-5 text-slate-400 shrink-0" />
                    <button
                      onClick={() => setExpandedModuleId(isExpanded ? null : mod.id)}
                      className="flex-1 flex items-center gap-2 text-left"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                      <input
                        type="text"
                        value={mod.title}
                        onChange={(e) => updateModuleTitle(mod.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="font-medium text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-teal-500 focus:outline-none px-1 -mx-1"
                      />
                      <span className="text-sm text-slate-500">
                        {mod.chapters.length} content items
                      </span>
                    </button>
                  </div>

                  {/* Module Content - Chapters */}
                  {isExpanded && (
                    <div className="bg-slate-50 p-4 pb-6">
                      <div className="space-y-2 mb-4">
                        {mod.chapters
                          .sort((a, b) => a.order - b.order)
                          .map((ch, chIndex) => {
                            const Icon = getContentIcon(ch.type);
                            return (
                              <div
                                key={ch.id}
                                draggable
                                onDragStart={() => setDraggedContentId(ch.id)}
                                onDragEnd={() => setDraggedContentId(null)}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  if (draggedContentId && draggedContentId !== ch.id) {
                                    const fromIdx = mod.chapters.findIndex((c) => c.id === draggedContentId);
                                    if (fromIdx >= 0) handleContentReorder(mod.id, fromIdx, chIndex);
                                  }
                                }}
                                className={`flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 ${
                                  draggedContentId === ch.id ? "opacity-50" : ""
                                }`}
                              >
                                <GripVertical className="w-4 h-4 text-slate-400 shrink-0 cursor-grab" />
                                <select
                                  value={ch.type}
                                  onChange={(e) =>
                                    updateChapter(mod.id, ch.id, { type: e.target.value as ContentType })
                                  }
                                  className="px-2 py-1 border border-slate-200 rounded text-sm"
                                >
                                  {CONTENT_TYPES.map((t) => (
                                    <option key={t} value={t}>{t.toUpperCase()}</option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  value={ch.title}
                                  onChange={(e) =>
                                    updateChapter(mod.id, ch.id, { title: e.target.value })
                                  }
                                  placeholder="Title"
                                  className="flex-1 px-2 py-1 border border-slate-200 rounded text-sm"
                                />
                                <input
                                  type="text"
                                  value={ch.url}
                                  onChange={(e) =>
                                    updateChapter(mod.id, ch.id, { url: e.target.value })
                                  }
                                  placeholder="URL or upload path"
                                  className="flex-1 px-2 py-1 border border-slate-200 rounded text-sm"
                                />
                                <button
                                  onClick={() => toggleChapterPublished(mod.id, ch.id)}
                                  className={`p-2 rounded ${
                                    ch.published ? "text-emerald-600 bg-emerald-50" : "text-slate-400 bg-slate-100"
                                  }`}
                                  title={ch.published ? "Published (visible to learners)" : "Unpublished (hidden)"}
                                >
                                  {ch.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => deleteChapter(mod.id, ch.id)}
                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            );
                          })}
                      </div>

                      <button
                        onClick={() => addChapter(mod.id)}
                        className="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        Add content (Video, PDF, PPT, Link)
                      </button>

                      {/* Module completion rules & Assessments */}
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <h4 className="text-sm font-medium text-slate-700 mb-2">Module Completion & Assessments</h4>
                        <div className="flex flex-wrap gap-2">
                          <select className="px-3 py-1.5 border border-slate-200 rounded text-sm">
                            <option>Watch videos</option>
                            <option>Pass quiz</option>
                            <option>Submit assignment</option>
                          </select>
                          <select className="px-3 py-1.5 border border-slate-200 rounded text-sm">
                            <option value="">Attach assessment...</option>
                            {assessments.map((a) => (
                              <option key={a.id} value={a.id}>{a.title} ({a.type})</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            placeholder="Pass score %"
                            className="w-24 px-2 py-1.5 border border-slate-200 rounded text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
