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
  RefreshCw,
  Upload,
} from "lucide-react";
import {
  toLearnerModules,
  CONTENT_TYPES,
  type CanonicalModule,
  type ContentItem,
  type ContentType,
} from "@/data/canonicalCourses";
import { useCanonicalStore } from "@/context/CanonicalStoreContext";
import { updateCourse as updateCourseAPI, getCourse, createCourse } from "@/lib/api/courses";
import { listQuizzesByCourse, createQuiz, type QuizSummary } from "@/lib/api/quizzes";
import { getCourseEnrollments, getCourseSubmissionStats, getCourseQuizAttempts, type QuizAttemptForInstructor } from "@/lib/api/instructor";
import { createAssessment } from "@/lib/api/calendar";
import { generateAssignmentDescription, generateQuizQuestions } from "@/lib/api/ai";
import { extractDocumentText, ACCEPT_DOCUMENTS } from "@/lib/documentExtract";
import { uploadFileToS3 } from "@/lib/api/media";

const FileTextIcon = FileText;

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
  const { getCourseById, addCourse, updateCourse, setCourseModules, publishCourse, refresh: refreshCanonical } = useCanonicalStore();
  let course = getCourseById(courseId);
  const [fetchingCourse, setFetchingCourse] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);

  // When course not in canonical store (e.g. from My Courses), fetch from backend and add
  useEffect(() => {
    if (course || !courseId || fetchingCourse) return;
    setFetchingCourse(true);
    setFetchFailed(false);
    getCourse(courseId)
      .then((apiCourse) => {
        const canonical: Parameters<typeof addCourse>[0] = {
          id: String(apiCourse.id),
          backendId: String(apiCourse.id),
          title: apiCourse.title,
          description: apiCourse.description || apiCourse.title,
          videoUrl: apiCourse.videoUrl,
          thumbnail: undefined,
          estimatedDuration: "2 weeks",
          status: apiCourse.status as "draft" | "published" | "archived" | "pending_approval" | "rejected",
          roles: apiCourse.tags?.length ? apiCourse.tags : ["General"],
          phase: "Foundation",
          courseOrder: 1,
          prerequisiteCourseIds: [],
          modules: [],
          instructor: { name: apiCourse.createdBy?.name ?? "Instructor", role: "Tech Lead" },
          skills: [],
          pathSlug: "fullstack",
          lastUpdated: apiCourse.updatedAt?.split("T")[0] || "",
          enrolledCount: 0,
          completionRate: 0,
          createdAt: apiCourse.createdAt?.split("T")[0] || "",
        };
        addCourse(canonical);
        refreshCanonical();
      })
      .catch(() => setFetchFailed(true))
      .finally(() => setFetchingCourse(false));
  }, [courseId, course, fetchingCourse, addCourse, refreshCanonical]);

  // Re-read course after backend fetch adds it
  if (!course && !fetchingCourse && !fetchFailed) {
    course = getCourseById(courseId);
  }

  const [modules, setModules] = useState<CanonicalModule[]>(course?.modules ?? []);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(modules[0]?.id ?? null);
  const [draggedModuleId, setDraggedModuleId] = useState<string | null>(null);
  const [draggedContentId, setDraggedContentId] = useState<string | null>(null);

  useEffect(() => {
    if (course) setModules([...course.modules]);
  }, [courseId, course]);

  useEffect(() => {
    if (course) {
      setEditTitle(course.title);
      setEditDescription(course.description || "");
      setEditThumbnail(course.thumbnail || "");
    }
  }, [course?.id, course?.title, course?.description, course?.thumbnail]);

  const backendId = course?.backendId != null ? Number(course.backendId) : null;
  const [enrollments, setEnrollments] = useState<{ userId: string; name: string; email: string; enrolledAt: string }[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const [submissionStats, setSubmissionStats] = useState<{ quizSubmissions: number; quizTotal: number; assessmentTotal: number } | null>(null);
  const [courseQuizAttempts, setCourseQuizAttempts] = useState<QuizAttemptForInstructor[]>([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editThumbnail, setEditThumbnail] = useState("");
  const [editThumbnailFileKey, setEditThumbnailFileKey] = useState("");
  const [editThumbnailFileName, setEditThumbnailFileName] = useState("");
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [thumbnailError, setThumbnailError] = useState("");

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

  useEffect(() => {
    if (backendId == null) return;
    let cancelled = false;
    setEnrollmentsLoading(true);
    getCourseEnrollments(String(backendId))
      .then((res) => { if (!cancelled) setEnrollments(res.enrollments || []); })
      .catch(() => { if (!cancelled) setEnrollments([]); })
      .finally(() => { if (!cancelled) setEnrollmentsLoading(false); });
    return () => { cancelled = true; };
  }, [backendId]);

  useEffect(() => {
    if (backendId == null) return;
    let cancelled = false;
    getCourseSubmissionStats(String(backendId))
      .then((res) => { if (!cancelled) setSubmissionStats(res); })
      .catch(() => { if (!cancelled) setSubmissionStats(null); });
    return () => { cancelled = true; };
  }, [backendId]);

  const fetchCourseQuizAttempts = useCallback(() => {
    if (backendId == null) return;
    setAttemptsLoading(true);
    getCourseQuizAttempts(String(backendId))
      .then((res) => setCourseQuizAttempts(res.attempts || []))
      .catch(() => setCourseQuizAttempts([]))
      .finally(() => setAttemptsLoading(false));
  }, [backendId]);

  useEffect(() => {
    if (backendId == null) return;
    fetchCourseQuizAttempts();
    const interval = setInterval(fetchCourseQuizAttempts, 30000);
    return () => clearInterval(interval);
  }, [backendId, fetchCourseQuizAttempts]);

  if (!course) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/instructor/courses" className="text-teal-600 hover:underline">
          ← Back to Courses
        </Link>
        {fetchingCourse ? (
          <div className="flex items-center gap-2 text-slate-600 py-8">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading course…
          </div>
        ) : fetchFailed ? (
          <p className="text-slate-600 py-8">Could not load course. It may have been deleted or you don’t have access.</p>
        ) : (
          <p className="text-slate-600 py-8">Course not found</p>
        )}
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

  const learnerModules = toLearnerModules(modules);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [topicsPrompt, setTopicsPrompt] = useState("");
  const [quizFiles, setQuizFiles] = useState<{ name: string; content: string }[]>([]);
  const [fileContent, setFileContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileUploading, setFileUploading] = useState(false);
  const [createQuizLoading, setCreateQuizLoading] = useState(false);
  const [createQuizError, setCreateQuizError] = useState("");
  const [createQuizGenerating, setCreateQuizGenerating] = useState(false);
  const [createQuizGeneratedPreview, setCreateQuizGeneratedPreview] = useState<Array<{ questionText: string; options: [string, string, string, string]; correctAnswerIndex: number }> | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncError, setSyncError] = useState("");

  // Inline Add Assignment (same as create course - no redirect to assessments page)
  const [assessmentPlaceholders, setAssessmentPlaceholders] = useState<{ id: string; title: string; mode: "ai" | "manual"; description?: string; topicsPrompt?: string; passMark?: number; totalPoints?: number; dueDateISO?: string }[]>([]);
  const [showAddAssessment, setShowAddAssessment] = useState(false);
  const [newAssessmentTitle, setNewAssessmentTitle] = useState("");
  const [newAssessmentMode, setNewAssessmentMode] = useState<"ai" | "manual">("manual");
  const [newAssessmentDescription, setNewAssessmentDescription] = useState("");
  const [newAssessmentTopicsPrompt, setNewAssessmentTopicsPrompt] = useState("");
  const [newAssessmentFiles, setNewAssessmentFiles] = useState<{ name: string; content: string }[]>([]);
  const [newAssessmentGenerating, setNewAssessmentGenerating] = useState(false);
  const [newAssessmentGeneratedPreview, setNewAssessmentGeneratedPreview] = useState<string | null>(null);
  const [newAssessmentPassMark, setNewAssessmentPassMark] = useState("");
  const [newAssessmentTotalPoints, setNewAssessmentTotalPoints] = useState("");
  const [newAssessmentDueDate, setNewAssessmentDueDate] = useState("");

  const addAssessmentPlaceholder = () => {
    if (!newAssessmentTitle.trim()) return;
    const newAssessmentFileContent = newAssessmentFiles.map((f) => f.content).join("\n\n").trim();
    if (newAssessmentMode === "ai") {
      const desc = newAssessmentGeneratedPreview ?? newAssessmentDescription;
      if (!desc?.trim()) {
        setError("Generate assignment first or switch to manual");
        return;
      }
    } else if (!newAssessmentDescription.trim()) {
      setError("Manual assignment requires a description");
      return;
    }
    const pass = newAssessmentPassMark.trim() ? Number(newAssessmentPassMark) : undefined;
    const total = newAssessmentTotalPoints.trim() ? Number(newAssessmentTotalPoints) : undefined;
    if (pass != null && total != null && (pass < 0 || total <= 0 || pass > total)) {
      setError("Pass mark must be 0 to total, and total must be > 0");
      return;
    }
    setError("");
    const descToAdd =
      newAssessmentMode === "ai"
        ? (newAssessmentGeneratedPreview ?? newAssessmentDescription).trim()
        : newAssessmentDescription.trim();
    const dueDateISO = newAssessmentDueDate.trim() ? newAssessmentDueDate.trim().split("T")[0] : undefined;
    setAssessmentPlaceholders((p) => [
      ...p,
      {
        id: `a${Date.now()}`,
        title: newAssessmentTitle.trim(),
        mode: newAssessmentMode,
        ...(newAssessmentMode === "manual" && { description: descToAdd }),
        ...(newAssessmentMode === "ai" && { topicsPrompt: newAssessmentTopicsPrompt.trim(), description: descToAdd }),
        passMark: pass,
        totalPoints: total,
        dueDateISO,
      },
    ]);
    setNewAssessmentTitle("");
    setNewAssessmentMode("manual");
    setNewAssessmentDescription("");
    setNewAssessmentTopicsPrompt("");
    setNewAssessmentFiles([]);
    setNewAssessmentGeneratedPreview(null);
    setNewAssessmentPassMark("");
    setNewAssessmentTotalPoints("");
    setNewAssessmentDueDate("");
    setShowAddAssessment(false);
  };

  const removeAssessmentPlaceholder = (id: string) => {
    setAssessmentPlaceholders((p) => p.filter((a) => a.id !== id));
  };

  const handleGenerateAssignment = async () => {
    setNewAssessmentGenerating(true);
    setError("");
    try {
      const fileContent = newAssessmentFiles.map((f) => f.content).join("\n\n").trim();
      const res = await generateAssignmentDescription({
        prompt: newAssessmentTopicsPrompt.trim() || undefined,
        fileContent: fileContent || undefined,
      });
      setNewAssessmentGeneratedPreview(res.description || "");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e.response?.data?.message || e.message || "Failed to generate assignment");
    } finally {
      setNewAssessmentGenerating(false);
    }
  };

  const handleSave = async () => {
    setCourseModules(courseId, modules);
    const thumb = editThumbnail.trim() || editThumbnailFileKey || undefined;
    updateCourse(courseId, {
      title: editTitle.trim() || course?.title,
      description: editDescription.trim() || course?.description,
      thumbnail: thumb,
    });

    // Create new assessment placeholders via API
    const bid = course?.backendId ? Number(course.backendId) : null;
    if (bid && assessmentPlaceholders.length > 0) {
      setLoading(true);
      try {
        for (const a of assessmentPlaceholders) {
          try {
            await createAssessment({
              title: a.title,
              courseId: String(bid),
              courseTitle: course?.title || "",
              pathSlug: "fullstack",
              type: "assignment",
              dueDateISO: a.dueDateISO,
              passMark: a.passMark,
              totalPoints: a.totalPoints,
              description: a.description,
            });
          } catch (e) {
            console.warn("Assessment creation failed:", e);
          }
        }
        setAssessmentPlaceholders([]);
      } finally {
        setLoading(false);
      }
    }

    // Sync to backend if course exists in backend
    if (course && course.id) {
      try {
        setLoading(true);
        await updateCourseAPI(course.id, {
          title: (editTitle.trim() || course.title),
          description: (editDescription.trim() || course.description),
          videoUrl: course.videoUrl || undefined,
          thumbnail: (editThumbnail.trim() || editThumbnailFileKey) || undefined,
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
    const titleToUse = (editTitle.trim() || course.title);
    const descriptionToUse = (editDescription.trim() || course.description);

    setLoading(true);
    setError("");

    try {
      // Sync Basic Info to store before publishing
      updateCourse(courseId, { title: titleToUse, description: descriptionToUse, thumbnail: (editThumbnail.trim() || editThumbnailFileKey) || undefined });
      setCourseModules(courseId, modules);

      // Create new assessment placeholders via API before publishing
      const bid = course.backendId ? Number(course.backendId) : null;
      if (bid && assessmentPlaceholders.length > 0) {
        for (const a of assessmentPlaceholders) {
          try {
            await createAssessment({
              title: a.title,
              courseId: String(bid),
              courseTitle: titleToUse || "",
              pathSlug: "fullstack",
              type: "assignment",
              dueDateISO: a.dueDateISO,
              passMark: a.passMark,
              totalPoints: a.totalPoints,
              description: a.description,
            });
          } catch (e) {
            console.warn("Assessment creation failed:", e);
          }
        }
        setAssessmentPlaceholders([]);
      }

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
        const updatedCourse = await updateCourseAPI(backendId, {
          title: titleToUse,
          description: descriptionToUse,
          videoUrl: course.videoUrl || undefined,
          status: "published",
          tags: course.roles.length > 0 ? course.roles : ["General"],
        });

        publishCourse(courseId);
        updateCourse(courseId, { status: "published", backendId: updatedCourse.id, title: titleToUse, description: descriptionToUse, thumbnail: (editThumbnail.trim() || editThumbnailFileKey) || undefined });
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
              title: titleToUse,
              description: descriptionToUse,
              videoUrl: course.videoUrl || undefined,
              status: "published",
              tags: course.roles.length > 0 ? course.roles : ["General"],
            });
            if (newCourse.id) {
              updateCourse(courseId, { backendId: newCourse.id, title: titleToUse, description: descriptionToUse, thumbnail: (editThumbnail.trim() || editThumbnailFileKey) || undefined });
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

  const isDraft = course.status === "draft";

  return (
    <div className="space-y-6 max-w-4xl">
      <Link
        href="/dashboard/instructor/courses"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-600"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Courses
      </Link>

      {isDraft ? (
        <>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Edit Course</h1>
            <p className="text-slate-500 mt-1">
              Update modules, videos, quizzes, and assessments. When ready, click Publish.
            </p>
          </div>
          {/* Basic Info — same structure as Create Course */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-slate-800 mb-4">Basic Info</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Course Title *</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g., Introduction to React"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Overview</label>
                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Brief overview of the course..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Course Thumbnail</label>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={editThumbnail}
                    onChange={(e) => { setEditThumbnail(e.target.value); setEditThumbnailFileKey(""); setEditThumbnailFileName(""); setThumbnailError(""); }}
                    placeholder="Image URL (or upload below)"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="text-xs text-slate-500">— or —</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {editThumbnailFileKey && !thumbnailUploading ? (
                      <div className="flex items-center gap-2 flex-wrap p-3 rounded-lg border border-slate-200 bg-slate-50">
                        <span className="text-sm text-slate-700 truncate max-w-[200px]">{editThumbnailFileName || "File"}</span>
                        <span className="text-xs text-emerald-600">Uploaded</span>
                        <button type="button" onClick={() => { setEditThumbnailFileKey(""); setEditThumbnailFileName(""); setThumbnailError(""); }} className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 hover:underline"><X className="w-3.5 h-3.5" /> Remove</button>
                        <label className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 cursor-pointer">
                          <Upload className="w-3.5 h-3.5" /> Choose another
                          <input type="file" accept="*/*" multiple className="hidden" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setThumbnailUploading(true); setThumbnailError(""); setEditThumbnail("");
                            try {
                              const { fileKey } = await uploadFileToS3(file, { contentTypeCategory: "course_thumbnail", fileName: file.name, contentType: file.type || "image/png", courseId: backendId != null ? Number(backendId) : undefined });
                              setEditThumbnailFileKey(fileKey); setEditThumbnailFileName(file.name);
                            } catch (err: unknown) {
                              const msg = err && typeof err === "object" && "response" in err && (err as { response?: { status?: number } }).response?.status === 503 ? "File storage not configured. Use image URL instead." : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Upload failed";
                              setThumbnailError(msg);
                            } finally { setThumbnailUploading(false); e.target.value = ""; }
                          }} />
                        </label>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <label className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 text-sm">
                          <Upload className="w-4 h-4" /> Choose image
                          <input type="file" accept="*/*" multiple className="hidden" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setThumbnailUploading(true); setThumbnailError(""); setEditThumbnail("");
                            try {
                              const { fileKey } = await uploadFileToS3(file, { contentTypeCategory: "course_thumbnail", fileName: file.name, contentType: file.type || "image/png", courseId: backendId != null ? Number(backendId) : undefined });
                              setEditThumbnailFileKey(fileKey); setEditThumbnailFileName(file.name);
                            } catch (err: unknown) {
                              const msg = err && typeof err === "object" && "response" in err && (err as { response?: { status?: number } }).response?.status === 503 ? "File storage not configured. Use image URL instead." : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Upload failed";
                              setThumbnailError(msg);
                            } finally { setThumbnailUploading(false); e.target.value = ""; }
                          }} disabled={thumbnailUploading} />
                        </label>
                        {thumbnailUploading && <span className="text-sm text-slate-500">Uploading…</span>}
                        {thumbnailError && <span className="text-sm text-red-600">{thumbnailError}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Published: Course Header + Insights + Enrolled + Submissions */
        <div className="rounded-2xl card-gradient border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
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
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {course.status}
                  </span>
                  <span className="text-sm text-slate-500">
                    {course.roles.join(", ")} • {course.phase}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-red-700 text-xs max-w-xs">
                  {error}
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Instructor Insights — only for published */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
            <Users className="w-5 h-5 text-teal-600" />
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {backendId != null ? (enrollmentsLoading ? "…" : enrollments.length) : course.enrolledCount}
              </p>
              <p className="text-xs text-slate-500">Enrolled Learners</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
            <HelpCircle className="w-5 h-5 text-teal-600" />
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {submissionStats ? submissionStats.quizSubmissions : "—"}
              </p>
              <p className="text-xs text-slate-500">Quiz Submissions</p>
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

        {/* Enrolled Learners */}
        {backendId != null && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-teal-600" />
              Enrolled Learners
            </h2>
            {enrollmentsLoading ? (
              <div className="flex items-center gap-2 text-slate-500 py-8">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading learners…
              </div>
            ) : enrollments.length === 0 ? (
              <p className="text-slate-500 py-4">No learners enrolled yet.</p>
            ) : (
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Enrolled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map((e) => (
                      <tr key={e.userId} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 font-medium text-slate-800">{e.name}</td>
                        <td className="py-3 px-4 text-slate-600">{e.email}</td>
                        <td className="py-3 px-4 text-slate-500 text-sm">
                          {e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Recent quiz submissions — live data */}
        {backendId != null && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-teal-600" />
                Recent quiz submissions
              </h2>
              <button
                type="button"
                onClick={fetchCourseQuizAttempts}
                disabled={attemptsLoading}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium disabled:opacity-50"
              >
                {attemptsLoading ? "Loading…" : "Refresh"}
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-3">Learner quiz attempts for this course. Auto-refreshes every 30s.</p>
            {attemptsLoading && courseQuizAttempts.length === 0 ? (
              <div className="flex items-center gap-2 text-slate-500 py-6">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading submissions…
              </div>
            ) : courseQuizAttempts.length === 0 ? (
              <p className="text-slate-500 py-4">No quiz submissions yet.</p>
            ) : (
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Learner</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Quiz</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Score</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseQuizAttempts.slice(0, 20).map((a) => (
                      <tr key={a.id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 font-medium text-slate-800">{a.learnerName}</td>
                        <td className="py-3 px-4 text-slate-600">{a.quizTitle}</td>
                        <td className="py-3 px-4 text-right text-slate-700">
                          {a.score}/{a.totalQuestions}
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-sm">
                          {a.completedAt ? new Date(a.completedAt).toLocaleString() : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        </div>
      )}

      {/* Modules & Chapters — same order as Create Course */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">Modules & Chapters</h2>
            <p className="text-sm text-slate-500 mt-1">
              {isDraft ? "Add modules and content (videos, PDFs, links). Drag to reorder." : "Drag to reorder. Add content per module. Control publish/unpublish per item."}
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
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Quizzes for this course */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-2">
          <HelpCircle size={20} className="text-teal-600" />
          Quizzes
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          {isDraft ? "Add quizzes — choose AI-generated (prompt or file) or manual questions. No due dates when created here." : "Create quizzes for this course. Auto-graded. Learners see them on the course page."}
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
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => { setShowCreateQuiz(true); setNewQuizTitle(""); setCreateQuizError(""); }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium"
                >
                  <Plus size={18} />
                  Add Quiz
                </button>
              </div>
            </>
          )}
        </div>

        {/* Assignments — same structure as Create Course */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-2">
            <FileTextIcon size={20} className="text-teal-600" />
            Assignments
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            {isDraft ? "Add assignments with a problem statement. Manual or AI. No due dates when created here." : "Add assignments with a problem statement. Manual or AI. (Use the Assessments page for items with due dates.)"}
          </p>
          <ul className="space-y-2 mb-4">
            {assessmentPlaceholders.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50"
              >
                <span className="font-medium text-slate-800">
                  {a.title} <span className="text-slate-500 text-xs">({a.mode === "ai" ? "AI" : "Manual"})</span>
                  {a.passMark != null && a.totalPoints != null && (
                    <span className="text-slate-500 text-xs ml-1">— pass {a.passMark}/{a.totalPoints}</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => removeAssessmentPlaceholder(a.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
          {showAddAssessment ? (
            <div className="space-y-4 p-4 rounded-lg border border-slate-200 bg-slate-50">
              <input
                type="text"
                value={newAssessmentTitle}
                onChange={(e) => setNewAssessmentTitle(e.target.value)}
                placeholder="Assignment title *"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm"
              />
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" checked={newAssessmentMode === "manual"} onChange={() => setNewAssessmentMode("manual")} className="rounded" />
                  Manual
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" checked={newAssessmentMode === "ai"} onChange={() => setNewAssessmentMode("ai")} className="rounded" />
                  AI
                </label>
              </div>
              {newAssessmentMode === "manual" ? (
                <textarea
                  value={newAssessmentDescription}
                  onChange={(e) => setNewAssessmentDescription(e.target.value)}
                  placeholder="Assignment description / problem statement *"
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm"
                />
              ) : (
                <>
                  <textarea
                    value={newAssessmentTopicsPrompt}
                    onChange={(e) => setNewAssessmentTopicsPrompt(e.target.value)}
                    placeholder="Prompt to generate assignment (e.g. topic, requirements)"
                    rows={2}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Or choose file(s)</label>
                    <div className="space-y-2">
                      {newAssessmentFiles.map((f, idx) => (
                        <div key={idx} className="flex items-center gap-2 flex-wrap p-3 rounded-lg border border-slate-200 bg-slate-50">
                          <span className="text-sm text-slate-700 truncate max-w-[200px]">{f.name}</span>
                          <span className="text-xs text-emerald-600">File uploaded</span>
                          <button type="button" onClick={() => setNewAssessmentFiles((prev) => prev.filter((_, i) => i !== idx))} className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 hover:underline"><X className="w-3.5 h-3.5" /> Remove</button>
                        </div>
                      ))}
                      <label className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 text-sm">
                        <Upload className="w-4 h-4" />
                        {newAssessmentFiles.length ? "Add another file" : "Choose file (PDF, Word, Excel, PPT, text)"}
                        <input type="file" accept={ACCEPT_DOCUMENTS} multiple className="hidden" onChange={async (e) => {
                          const list = e.target.files;
                          if (!list?.length) return;
                          setError("");
                          for (const file of Array.from(list)) {
                            const { text, error: extractError } = await extractDocumentText(file);
                            if (extractError) { setError(extractError); e.target.value = ""; return; }
                            setNewAssessmentFiles((prev) => [...prev, { name: file.name, content: text.slice(0, 50000) }]);
                          }
                          e.target.value = "";
                        }} />
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={handleGenerateAssignment} disabled={newAssessmentGenerating || (!newAssessmentTopicsPrompt.trim() && newAssessmentFiles.length === 0)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 text-sm">
                      {newAssessmentGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      {newAssessmentGenerating ? "Generating…" : "Generate"}
                    </button>
                    {newAssessmentGeneratedPreview && (
                      <button type="button" onClick={handleGenerateAssignment} disabled={newAssessmentGenerating} className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm">
                        <RefreshCw className="w-4 h-4" /> Regenerate
                      </button>
                    )}
                  </div>
                  {newAssessmentGeneratedPreview && (
                    <div className="rounded border border-slate-200 bg-white p-4">
                      <p className="text-sm font-medium text-slate-700 mb-2">Preview (edit as needed)</p>
                      <textarea value={newAssessmentGeneratedPreview} onChange={(e) => setNewAssessmentGeneratedPreview(e.target.value)} rows={8} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm" />
                    </div>
                  )}
                </>
              )}
              <div className="grid grid-cols-2 gap-2">
                <div><label className="block text-xs text-slate-500 mb-1">Pass mark</label><input type="number" min={0} value={newAssessmentPassMark} onChange={(e) => setNewAssessmentPassMark(e.target.value)} placeholder="e.g. 7" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm" /></div>
                <div><label className="block text-xs text-slate-500 mb-1">Out of total</label><input type="number" min={1} value={newAssessmentTotalPoints} onChange={(e) => setNewAssessmentTotalPoints(e.target.value)} placeholder="e.g. 10" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm" /></div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Due date (shows on learner calendar)</label>
                <input type="date" value={newAssessmentDueDate} onChange={(e) => setNewAssessmentDueDate(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setShowAddAssessment(false); setNewAssessmentTitle(""); setNewAssessmentDescription(""); setNewAssessmentTopicsPrompt(""); setNewAssessmentFiles([]); setNewAssessmentGeneratedPreview(null); setNewAssessmentPassMark(""); setNewAssessmentTotalPoints(""); setNewAssessmentDueDate(""); }} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg">Cancel</button>
                <button type="button" onClick={addAssessmentPlaceholder} disabled={!newAssessmentTitle.trim()} className="px-3 py-1.5 text-sm bg-teal-600 text-white rounded-lg disabled:opacity-50">Add</button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setShowAddAssessment(true)} className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 text-sm font-medium">
              <Plus size={18} /> Add Assignment
            </button>
          )}
        </div>

      {/* Create Quiz Modal (Generate with AI) */}
      {showCreateQuiz && backendId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Create quiz with AI</h3>
              <button onClick={() => { setShowCreateQuiz(false); setNewQuizTitle(""); setTopicsPrompt(""); setQuizFiles([]); setFileContent(""); setFileName(""); setCreateQuizError(""); setCreateQuizGeneratedPreview(null); }} className="p-2 rounded-lg hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              AI will generate 10 MCQs. Optionally specify topics or upload a document (PDF, Word, Excel, or text). All quizzes are auto-graded.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quiz title</label>
                <input
                  type="text"
                  value={newQuizTitle}
                  onChange={(e) => setNewQuizTitle(e.target.value)}
                  placeholder="e.g. HTML & CSS Fundamentals Quiz"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Topics to cover (optional)</label>
                <textarea
                  value={topicsPrompt}
                  onChange={(e) => setTopicsPrompt(e.target.value)}
                  placeholder="e.g. HTML semantics, CSS selectors, forms, layout and positioning"
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Or upload document (optional)</label>
                {fileContent ? (
                  <div className="flex items-center gap-2 flex-wrap p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <span className="text-sm text-slate-700 truncate max-w-[200px]">{fileName || "File"}</span>
                    <span className="text-xs text-emerald-600">File uploaded</span>
                    <button
                      type="button"
                      onClick={() => { setFileContent(""); setFileName(""); setCreateQuizError(""); }}
                      className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 hover:underline"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                    <label className="ml-auto inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 cursor-pointer">
                      Change file
                      <input
                        type="file"
                        accept={ACCEPT_DOCUMENTS}
                        multiple
                        className="hidden"
                        onChange={async (e) => {
                          const list = e.target.files;
                          if (!list?.length) return;
                          setFileUploading(true); setCreateQuizError("");
                          const parts: string[] = []; const names: string[] = [];
                          for (const file of Array.from(list)) {
                            const { text, error: extractError } = await extractDocumentText(file);
                            if (extractError) { setCreateQuizError(extractError); setFileUploading(false); e.target.value = ""; return; }
                            parts.push(text.slice(0, 50000)); names.push(file.name);
                          }
                          setFileContent(parts.join("\n\n")); setFileName(names.length === 1 ? names[0] : `${names.length} files`);
                          setFileUploading(false); e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      accept={ACCEPT_DOCUMENTS}
                      multiple
                      onChange={async (e) => {
                        const list = e.target.files;
                        if (!list?.length) return;
                        setFileUploading(true); setCreateQuizError("");
                        const parts: string[] = []; const names: string[] = [];
                        for (const file of Array.from(list)) {
                          const { text, error: extractError } = await extractDocumentText(file);
                          if (extractError) { setCreateQuizError(extractError); setFileUploading(false); e.target.value = ""; return; }
                          parts.push(text.slice(0, 50000)); names.push(file.name);
                        }
                        setFileContent(parts.join("\n\n")); setFileName(names.length === 1 ? names[0] : `${names.length} files`);
                        setFileUploading(false); e.target.value = "";
                      }}
                      className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal-50 file:text-teal-700 file:font-medium hover:file:bg-teal-100"
                    />
                    {fileUploading && <span className="text-xs text-slate-500 mt-1 block">Reading file…</span>}
                  </>
                )}
              </div>
            </div>
            {createQuizError && (
              <p className="text-sm text-red-600 mt-4">{createQuizError}</p>
            )}
            {/* Step 1: Generate → show preview. Step 2: Review → Create quiz */}
            {createQuizGeneratedPreview && createQuizGeneratedPreview.length > 0 ? (
              <>
                <div className="rounded border border-slate-200 bg-slate-50 p-4 mt-4 space-y-3 max-h-64 overflow-y-auto">
                  <p className="text-sm font-medium text-slate-700">Review AI-generated questions (edit or remove before creating)</p>
                  {createQuizGeneratedPreview.map((qq, idx) => (
                    <div key={idx} className="p-3 rounded border border-slate-200 bg-white space-y-2">
                      <input
                        type="text"
                        value={qq.questionText}
                        onChange={(e) => {
                          const next = [...createQuizGeneratedPreview];
                          next[idx] = { ...next[idx], questionText: e.target.value };
                          setCreateQuizGeneratedPreview(next);
                        }}
                        placeholder="Question"
                        className="w-full px-3 py-2 border border-slate-200 rounded text-sm"
                      />
                      {qq.options.map((opt, oi) => (
                        <input
                          key={oi}
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const next = [...createQuizGeneratedPreview];
                            const opts = [...next[idx].options];
                            opts[oi] = e.target.value;
                            next[idx] = { ...next[idx], options: opts };
                            setCreateQuizGeneratedPreview(next);
                          }}
                          placeholder={`Option ${oi + 1}`}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm"
                        />
                      ))}
                      <div className="flex items-center gap-2 flex-wrap">
                        <select
                          value={qq.correctAnswerIndex}
                          onChange={(e) => {
                            const next = [...createQuizGeneratedPreview];
                            next[idx] = { ...next[idx], correctAnswerIndex: Number(e.target.value) };
                            setCreateQuizGeneratedPreview(next);
                          }}
                          className="px-3 py-1.5 border border-slate-200 rounded text-sm"
                        >
                          {[0, 1, 2, 3].map((i) => (
                            <option key={i} value={i}>Correct: Option {i + 1}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setCreateQuizGeneratedPreview((p) => (p ? p.filter((_, i) => i !== idx) : []))}
                          className="text-red-600 text-xs hover:underline"
                        >
                          Delete question
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => { setCreateQuizGeneratedPreview(null); }}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Back to edit prompt
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowCreateQuiz(false); setNewQuizTitle(""); setTopicsPrompt(""); setFileContent(""); setFileName(""); setCreateQuizError(""); setCreateQuizGeneratedPreview(null); }}
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!newQuizTitle.trim() || createQuizGeneratedPreview.length < 1 || createQuizLoading}
                    onClick={async () => {
                      setCreateQuizError("");
                      setCreateQuizLoading(true);
                      try {
                        await createQuiz(backendId, {
                          title: newQuizTitle.trim(),
                          questions: createQuizGeneratedPreview.map((q) => ({
                            questionText: q.questionText.trim(),
                            options: q.options.map((o) => o.trim()),
                            correctAnswerIndex: q.correctAnswerIndex,
                          })),
                        });
                        setShowCreateQuiz(false);
                        setNewQuizTitle("");
                        setTopicsPrompt("");
                        setFileContent("");
                        setFileName("");
                        setCreateQuizGeneratedPreview(null);
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
                    {createQuizLoading ? <Loader2 size={18} className="animate-spin" /> : null}
                    Create quiz
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowCreateQuiz(false); setNewQuizTitle(""); setTopicsPrompt(""); setFileContent(""); setFileName(""); setCreateQuizError(""); setCreateQuizGeneratedPreview(null); }}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!newQuizTitle.trim() || (!topicsPrompt.trim() && !fileContent.trim()) || createQuizGenerating}
                  onClick={async () => {
                    setCreateQuizError("");
                    setCreateQuizGenerating(true);
                    try {
                      const res = await generateQuizQuestions({
                        topicsPrompt: topicsPrompt.trim() || undefined,
                        fileContent: fileContent.trim() || undefined,
                        courseTitle: course?.title || undefined,
                        numberOfQuestions: 10,
                      });
                      setCreateQuizGeneratedPreview(
                        res.questions.map((q) => ({
                          questionText: q.questionText,
                          options: q.options as [string, string, string, string],
                          correctAnswerIndex: q.correctAnswerIndex,
                        }))
                      );
                    } catch (err: unknown) {
                      const e = err as { response?: { data?: { message?: string } } };
                      setCreateQuizError(e.response?.data?.message || "Failed to generate quiz");
                    } finally {
                      setCreateQuizGenerating(false);
                    }
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
                >
                  {createQuizGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  Generate & review
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom actions — Save draft / Publish (draft) or shown in header (published) */}
      {isDraft && (
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200">
          {error && (
            <div className="w-full bg-red-50 border border-red-200 rounded-lg p-2 text-red-700 text-sm">
              {error}
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save draft"}
          </button>
          <button
            onClick={handlePublish}
            disabled={loading}
            className="px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Publishing..." : "Publish"}
          </button>
        </div>
      )}
    </div>
  );
}
