"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  Plus,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Trash2,
  Video,
  FileText,
  Link as LinkIcon,
  Eye,
  EyeOff,
  HelpCircle,
  FileText as FileTextIcon,
  X,
  Sparkles,
  RefreshCw,
  Upload,
} from "lucide-react";
import { getCurrentUser } from "@/lib/currentUser";
import { createCourse } from "@/lib/api/courses";
import { createQuiz } from "@/lib/api/quizzes";
import { createAssessment } from "@/lib/api/calendar";
import { generateQuizQuestions, generateAssignmentDescription } from "@/lib/api/ai";
import { getUploadUrl, uploadFileToS3 } from "@/lib/api/media";
import { extractDocumentText, ACCEPT_DOCUMENTS } from "@/lib/documentExtract";
import { useCanonicalStore } from "@/context/CanonicalStoreContext";
import {
  CONTENT_TYPES,
  type CanonicalModule,
  type ContentItem,
  type ContentType,
} from "@/data/canonicalCourses";

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

type QuizQuestion = { questionText: string; options: [string, string, string, string]; correctAnswerIndex: number };
type QuizPlaceholder = {
  id: string;
  title: string;
  mode: "ai" | "manual";
  numberOfQuestions?: number;
  passMark?: number;
  totalPoints?: number;
  topicsPrompt?: string;
  fileContent?: string;
  questions?: QuizQuestion[];
};
type AssessmentPlaceholder = {
  id: string;
  title: string;
  mode: "ai" | "manual";
  description?: string;
  topicsPrompt?: string;
  passMark?: number;
  totalPoints?: number;
};

export default function NewCoursePage() {
  const router = useRouter();
  const { addCourse, refresh } = useCanonicalStore();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingStep, setLoadingStep] = useState("");

  const [title, setTitle] = useState("");
  const [overview, setOverview] = useState("");
  const [outcomes, setOutcomes] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [thumbnailFileKey, setThumbnailFileKey] = useState("");
  const [thumbnailFileName, setThumbnailFileName] = useState("");
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [thumbnailError, setThumbnailError] = useState("");

  const [modules, setModules] = useState<CanonicalModule[]>([]);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [draggedModuleId, setDraggedModuleId] = useState<string | null>(null);
  const [draggedContentId, setDraggedContentId] = useState<string | null>(null);

  const [quizPlaceholders, setQuizPlaceholders] = useState<QuizPlaceholder[]>([]);
  const [assessmentPlaceholders, setAssessmentPlaceholders] = useState<AssessmentPlaceholder[]>([]);
  const [showAddQuiz, setShowAddQuiz] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [newQuizMode, setNewQuizMode] = useState<"ai" | "manual">("ai");
  const [newQuizTopics, setNewQuizTopics] = useState("");
  const [newQuizFiles, setNewQuizFiles] = useState<{ name: string; content: string }[]>([]);
  const [newQuizQuestions, setNewQuizQuestions] = useState<QuizQuestion[]>([]);
  const [showAddAssessment, setShowAddAssessment] = useState(false);
  const [newAssessmentTitle, setNewAssessmentTitle] = useState("");
  const [newAssessmentMode, setNewAssessmentMode] = useState<"ai" | "manual">("manual");
  const [newAssessmentDescription, setNewAssessmentDescription] = useState("");
  const [newAssessmentTopicsPrompt, setNewAssessmentTopicsPrompt] = useState("");
  const [newAssessmentFiles, setNewAssessmentFiles] = useState<{ name: string; content: string }[]>([]);
  const [newAssessmentPassMark, setNewAssessmentPassMark] = useState("");
  const [newAssessmentTotalPoints, setNewAssessmentTotalPoints] = useState("");
  const [newQuizNumberOfQuestions, setNewQuizNumberOfQuestions] = useState("10");
  const [newQuizPassMark, setNewQuizPassMark] = useState("");
  const [newQuizTotalPoints, setNewQuizTotalPoints] = useState("");
  const [newQuizGenerating, setNewQuizGenerating] = useState(false);
  const [newQuizGeneratedPreview, setNewQuizGeneratedPreview] = useState<QuizQuestion[] | null>(null);
  const [newAssessmentGenerating, setNewAssessmentGenerating] = useState(false);
  const [newAssessmentGeneratedPreview, setNewAssessmentGeneratedPreview] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const user = getCurrentUser();
    setUserRole(user?.role || null);
  }, []);

  const isAuthorized = userRole === "instructor" || userRole === "admin";
  const outcomesList = outcomes.split("\n").map((s) => s.trim()).filter(Boolean);

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
    setModules((prev) => prev.map((m) => (m.id === moduleId ? { ...m, title } : m)));
  };

  const updateChapter = (moduleId: string, chapterId: string, updates: Partial<ContentItem>) => {
    setModules((prev) =>
      prev.map((mod) => {
        if (mod.id !== moduleId) return mod;
        return {
          ...mod,
          chapters: mod.chapters.map((c) => (c.id === chapterId ? { ...c, ...updates } : c)),
        };
      })
    );
  };

  const deleteChapter = (moduleId: string, chapterId: string) => {
    setModules((prev) =>
      prev.map((mod) => {
        if (mod.id !== moduleId) return mod;
        return { ...mod, chapters: mod.chapters.filter((c) => c.id !== chapterId) };
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

  const addManualQuestion = () => {
    setNewQuizQuestions((q) => [
      ...q,
      { questionText: "", options: ["", "", "", ""], correctAnswerIndex: 0 },
    ]);
  };
  const updateManualQuestion = (idx: number, upd: Partial<QuizQuestion>) => {
    setNewQuizQuestions((q) =>
      q.map((item, i) => (i === idx ? { ...item, ...upd } : item))
    );
  };
  const removeManualQuestion = (idx: number) => {
    setNewQuizQuestions((q) => q.filter((_, i) => i !== idx));
  };

  const newQuizFileContent = newQuizFiles.map((f) => f.content).join("\n\n").trim();
  const newAssessmentFileContent = newAssessmentFiles.map((f) => f.content).join("\n\n").trim();

  const handleGenerateQuiz = async () => {
    if (!newQuizTopics.trim() && !newQuizFileContent) {
      setError("AI quiz requires a prompt or file content");
      return;
    }
    setError("");
    setNewQuizGenerating(true);
    const numQ = Math.min(20, Math.max(1, Number(newQuizNumberOfQuestions) || 10));
    try {
      const res = await generateQuizQuestions({
        topicsPrompt: newQuizTopics.trim() || undefined,
        fileContent: newQuizFileContent || undefined,
        courseTitle: title.trim() || undefined,
        numberOfQuestions: numQ,
      });
      setNewQuizGeneratedPreview(
        res.questions.map((q) => ({
          questionText: q.questionText,
          options: q.options as [string, string, string, string],
          correctAnswerIndex: q.correctAnswerIndex,
        }))
      );
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || "Failed to generate quiz");
    } finally {
      setNewQuizGenerating(false);
    }
  };

  const handleGenerateAssignment = async () => {
    if (!newAssessmentTopicsPrompt.trim() && !newAssessmentFileContent) {
      setError("AI assignment requires a prompt or file content");
      return;
    }
    setError("");
    setNewAssessmentGenerating(true);
    try {
      const res = await generateAssignmentDescription({
        prompt: newAssessmentTopicsPrompt.trim() || undefined,
        fileContent: newAssessmentFileContent || undefined,
      });
      setNewAssessmentGeneratedPreview(res.description);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || "Failed to generate assignment");
    } finally {
      setNewAssessmentGenerating(false);
    }
  };

  const addQuizPlaceholder = () => {
    if (!newQuizTitle.trim()) return;
    if (newQuizMode === "ai") {
      const questionsToUse = newQuizGeneratedPreview;
      if (!questionsToUse || questionsToUse.length < 1) {
        setError("Generate quiz first, or switch to manual");
        return;
      }
    } else {
      const valid = newQuizQuestions.filter(
        (q) => q.questionText.trim() && q.options.every((o) => o.trim())
      );
      if (valid.length < 1) {
        setError("Manual quiz requires at least 1 question with 4 options");
        return;
      }
    }
    const totalQ =
      newQuizMode === "ai"
        ? newQuizGeneratedPreview!.length
        : newQuizQuestions.filter((q) => q.questionText.trim() && q.options.every((o) => o.trim())).length;
    const pass = newQuizPassMark.trim() ? Number(newQuizPassMark) : undefined;
    const total = newQuizTotalPoints.trim() ? Number(newQuizTotalPoints) : totalQ;
    if (pass != null && total != null && (pass < 0 || total <= 0 || pass > total)) {
      setError("Pass mark must be 0 to total, and total must be > 0");
      return;
    }
    setError("");
    const questionsToAdd =
      newQuizMode === "ai"
        ? newQuizGeneratedPreview!.map((q) => ({
            questionText: q.questionText.trim(),
            options: q.options.map((o) => o.trim()),
            correctAnswerIndex: q.correctAnswerIndex,
          }))
        : newQuizQuestions
            .filter((q) => q.questionText.trim() && q.options.every((o) => o.trim()))
            .map((q) => ({
              questionText: q.questionText.trim(),
              options: q.options.map((o) => o.trim()),
              correctAnswerIndex: q.correctAnswerIndex,
            }));
    setQuizPlaceholders((p) => [
      ...p,
      {
        id: `q${Date.now()}`,
        title: newQuizTitle.trim(),
        mode: newQuizMode,
        numberOfQuestions: newQuizMode === "ai" ? Math.min(20, Math.max(1, Number(newQuizNumberOfQuestions) || 10)) : totalQ,
        passMark: pass,
        totalPoints: total,
        ...(newQuizMode === "ai" && {
          topicsPrompt: newQuizTopics.trim() || undefined,
          fileContent: newQuizFileContent || undefined,
          questions: questionsToAdd,
        }),
        ...(newQuizMode === "manual" && { questions: questionsToAdd }),
      },
    ]);
    setNewQuizTitle("");
    setNewQuizMode("ai");
    setNewQuizNumberOfQuestions("10");
    setNewQuizPassMark("");
    setNewQuizTotalPoints("");
    setNewQuizTopics("");
    setNewQuizFiles([]);
    setNewQuizQuestions([]);
    setNewQuizGeneratedPreview(null);
    setShowAddQuiz(false);
  };

  const removeQuizPlaceholder = (id: string) => {
    setQuizPlaceholders((p) => p.filter((q) => q.id !== id));
  };

  const addAssessmentPlaceholder = () => {
    if (!newAssessmentTitle.trim()) return;
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
    setShowAddAssessment(false);
  };

  const removeAssessmentPlaceholder = (id: string) => {
    setAssessmentPlaceholders((p) => p.filter((a) => a.id !== id));
  };

  const handleCreate = async (status: "draft" | "published") => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setLoading(true);
    setError("");
    const user = getCurrentUser();
    try {
      setLoadingStep("Creating course…");
      const backendCourse = await createCourse({
        title: title.trim(),
        description: overview.trim() || title.trim(),
        overview: overview.trim() || undefined,
        outcomes: outcomesList.length > 0 ? outcomesList : undefined,
        status,
        tags: ["General"],
        thumbnail: thumbnailUrl.trim() || thumbnailFileKey.trim() || undefined,
      });

      const backendId = backendCourse.id;
      addCourse({
        id: String(backendId),
        backendId: backendId,
        title: title.trim(),
        description: overview.trim() || title.trim(),
        videoUrl: undefined,
        thumbnail: thumbnailUrl.trim() || thumbnailFileKey.trim() || undefined,
        estimatedDuration: "2 weeks",
        status,
        roles: ["General"],
        phase: "Foundation",
        courseOrder: 1,
        prerequisiteCourseIds: [],
        modules: modules.map((m, i) => ({ ...m, order: i })),
        instructor: { name: user?.name ?? "Instructor", role: "Tech Lead" },
        skills: [],
        pathSlug: "fullstack",
        lastUpdated: new Date().toISOString().split("T")[0],
        enrolledCount: 0,
        completionRate: 0,
        createdAt: new Date().toISOString().split("T")[0],
      });
      refresh();

      for (let i = 0; i < quizPlaceholders.length; i++) {
        const q = quizPlaceholders[i];
        setLoadingStep(`Creating quiz ${i + 1}/${quizPlaceholders.length}…`);
        try {
          await createQuiz(Number(backendId), {
            title: q.title,
            generateWithAi: q.mode === "ai",
            numberOfQuestions: q.numberOfQuestions,
            passMark: q.passMark,
            totalPoints: q.totalPoints,
            ...(q.mode === "ai" && (q.topicsPrompt || q.fileContent) && {
              topicsPrompt: q.topicsPrompt || "",
              ...(q.fileContent && { fileContent: q.fileContent }),
            }),
            ...(q.mode === "manual" && q.questions && q.questions.length > 0 && {
              questions: q.questions.map((qu) => ({
                questionText: qu.questionText,
                options: qu.options,
                correctAnswerIndex: qu.correctAnswerIndex,
              })),
            }),
          });
        } catch (e) {
          console.warn("Quiz creation failed:", e);
        }
      }

      for (let i = 0; i < assessmentPlaceholders.length; i++) {
        const a = assessmentPlaceholders[i];
        setLoadingStep(`Creating assignment ${i + 1}/${assessmentPlaceholders.length}…`);
        try {
          await createAssessment({
            title: a.title,
            courseId: String(backendId),
            courseTitle: title.trim(),
            pathSlug: "fullstack",
            type: "assignment",
            passMark: a.passMark,
            totalPoints: a.totalPoints,
            description: a.description,
          });
        } catch (e) {
          console.warn("Assessment creation failed:", e);
        }
      }

      router.push(`/dashboard/instructor/courses/${backendId}`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string }; status?: number }; message?: string };
      if (e.response?.status === 403) {
        setError("Insufficient permissions. You need an instructor or admin account.");
      } else {
        setError(e.response?.data?.message || e.message || "Failed to create course.");
      }
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  if (mounted && !isAuthorized) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Link href="/dashboard/instructor/courses" className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-600">
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Link>
        <div className="bg-white border border-red-200 rounded-xl p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">Insufficient Permissions</h2>
              <p className="text-slate-600 mb-4">
                You need an instructor or admin account to create courses. Your role:{" "}
                <strong>{userRole || "unknown"}</strong>
              </p>
              <button
                onClick={() => router.push("/dashboard/instructor/courses")}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/dashboard/instructor/courses" className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-600">
        <ArrowLeft className="w-4 h-4" />
        Back to Courses
      </Link>

      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Create Course</h1>
        <p className="text-slate-500 mt-1">
          Add everything here — modules, videos, quizzes, assessments. Then click Create Draft or Publish.
        </p>
      </div>

      {/* Basic info */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-slate-800 mb-4">Basic Info</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Course Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Introduction to React"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Overview</label>
            <textarea
              rows={4}
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              placeholder="Brief overview of the course..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Learning Outcomes</label>
            <textarea
              rows={4}
              value={outcomes}
              onChange={(e) => setOutcomes(e.target.value)}
              placeholder="One outcome per line"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <p className="text-xs text-slate-500 mt-1">Enter one outcome per line</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Course Thumbnail</label>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={thumbnailUrl}
                onChange={(e) => { setThumbnailUrl(e.target.value); setThumbnailFileKey(""); setThumbnailFileName(""); setThumbnailError(""); }}
                placeholder="Image URL (link)"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <span className="text-xs text-slate-500">— or —</span>
              <div className="flex items-center gap-2 flex-wrap">
                {thumbnailFileKey && !thumbnailUploading ? (
                  <div className="flex items-center gap-2 flex-wrap p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <span className="text-sm text-slate-700 truncate max-w-[200px]">{thumbnailFileName || "File"}</span>
                    <span className="text-xs text-emerald-600">File uploaded</span>
                    <button
                      type="button"
                      onClick={() => { setThumbnailFileKey(""); setThumbnailFileName(""); setThumbnailError(""); }}
                      className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 hover:underline"
                    >
                      <X className="w-3.5 h-3.5" /> Remove
                    </button>
                    <label className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" /> Choose another
                      <input
                        type="file"
                        accept="*/*"
                        multiple
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setThumbnailUploading(true);
                          setThumbnailError("");
                          setThumbnailUrl("");
                          try {
                            const { fileKey } = await uploadFileToS3(file, {
                              contentTypeCategory: "course_thumbnail",
                              fileName: file.name,
                              contentType: file.type || "image/png",
                            });
                            setThumbnailFileKey(fileKey);
                            setThumbnailFileName(file.name);
                          } catch (err: unknown) {
                            const msg = err && typeof err === "object" && "response" in err
                              ? (err as { response?: { data?: { message?: string }; status?: number } }).response?.status === 503
                                ? "File storage not configured. Use image URL instead."
                                : (err as { response?: { data?: { message?: string } } }).response?.data?.message || "Thumbnail upload failed"
                              : "Thumbnail upload failed";
                            setThumbnailError(msg);
                          } finally {
                            setThumbnailUploading(false);
                            e.target.value = "";
                          }
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 text-sm">
                      <Upload className="w-4 h-4" />
                      Choose file(s)
                      <input
                        type="file"
                        accept="*/*"
                        multiple
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setThumbnailUploading(true);
                          setThumbnailError("");
                          setThumbnailUrl("");
                          try {
                            const { fileKey } = await uploadFileToS3(file, {
                              contentTypeCategory: "course_thumbnail",
                              fileName: file.name,
                              contentType: file.type || "image/png",
                            });
                            setThumbnailFileKey(fileKey);
                            setThumbnailFileName(file.name);
                          } catch (err: unknown) {
                            const msg = err && typeof err === "object" && "response" in err
                              ? (err as { response?: { data?: { message?: string }; status?: number } }).response?.status === 503
                                ? "File storage not configured. Use image URL instead."
                                : (err as { response?: { data?: { message?: string } } }).response?.data?.message || "Thumbnail upload failed"
                              : "Thumbnail upload failed";
                            setThumbnailError(msg);
                          } finally {
                            setThumbnailUploading(false);
                            e.target.value = "";
                          }
                        }}
                        disabled={thumbnailUploading}
                      />
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

      {/* Modules */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">Modules & Chapters</h2>
            <p className="text-sm text-slate-500 mt-1">
              Add modules and content (videos, PDFs, links). Drag to reorder.
            </p>
          </div>
          <button
            type="button"
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
                      type="button"
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
                      <span className="text-sm text-slate-500">{mod.chapters.length} items</span>
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
                                    <option key={t} value={t}>
                                      {t.toUpperCase()}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  value={ch.title}
                                  onChange={(e) => updateChapter(mod.id, ch.id, { title: e.target.value })}
                                  placeholder="Title"
                                  className="flex-1 px-2 py-1 border border-slate-200 rounded text-sm"
                                />
                                <input
                                  type="text"
                                  value={ch.url}
                                  onChange={(e) => updateChapter(mod.id, ch.id, { url: e.target.value })}
                                  placeholder="URL"
                                  className="flex-1 px-2 py-1 border border-slate-200 rounded text-sm"
                                />
                                <button
                                  type="button"
                                  onClick={() => toggleChapterPublished(mod.id, ch.id)}
                                  className={`p-2 rounded ${
                                    ch.published ? "text-emerald-600 bg-emerald-50" : "text-slate-400 bg-slate-100"
                                  }`}
                                  title={ch.published ? "Published" : "Unpublished"}
                                >
                                  {ch.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                                <button
                                  type="button"
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
                        type="button"
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

      {/* Quizzes — after videos, Add Quiz then Add Assessment. No dues. */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-2">
          <HelpCircle className="w-5 h-5 text-teal-600" />
          Quizzes
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Add quizzes — choose AI-generated (prompt or file) or manual questions. No due dates when created here.
        </p>
        <ul className="space-y-2 mb-4">
          {quizPlaceholders.map((q) => (
            <li
              key={q.id}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50"
            >
              <span className="font-medium text-slate-800">
                {q.title} <span className="text-slate-500 text-xs">({q.mode === "ai" ? "AI" : "Manual"})</span>
                {q.passMark != null && q.totalPoints != null && (
                  <span className="text-slate-500 text-xs ml-1">— pass {q.passMark}/{q.totalPoints}</span>
                )}
              </span>
              <button
                type="button"
                onClick={() => removeQuizPlaceholder(q.id)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
        {showAddQuiz ? (
          <div className="space-y-4 p-4 rounded-lg border border-slate-200 bg-slate-50">
            <input
              type="text"
              value={newQuizTitle}
              onChange={(e) => setNewQuizTitle(e.target.value)}
              placeholder="Quiz title *"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm"
            />
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={newQuizMode === "ai"}
                  onChange={() => setNewQuizMode("ai")}
                  className="rounded"
                />
                Generate AI Quiz
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={newQuizMode === "manual"}
                  onChange={() => setNewQuizMode("manual")}
                  className="rounded"
                />
                Add Manual Quiz
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Number of questions</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={newQuizNumberOfQuestions}
                  onChange={(e) => setNewQuizNumberOfQuestions(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div className="col-span-2 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Pass mark</label>
                  <input
                    type="number"
                    min={0}
                    value={newQuizPassMark}
                    onChange={(e) => setNewQuizPassMark(e.target.value)}
                    placeholder="e.g. 7"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Out of total</label>
                  <input
                    type="number"
                    min={1}
                    value={newQuizTotalPoints}
                    onChange={(e) => setNewQuizTotalPoints(e.target.value)}
                    placeholder="e.g. 10 (auto from questions)"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
            {newQuizMode === "ai" ? (
              <>
                <textarea
                  value={newQuizTopics}
                  onChange={(e) => setNewQuizTopics(e.target.value)}
                  placeholder="Prompt / topics to cover (e.g. React hooks, useEffect, useState)"
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm"
                />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Or choose file(s)</label>
                  <div className="space-y-2">
                    {newQuizFiles.map((f, idx) => (
                      <div key={idx} className="flex items-center gap-2 flex-wrap p-3 rounded-lg border border-slate-200 bg-slate-50">
                        <span className="text-sm text-slate-700 truncate max-w-[200px]">{f.name}</span>
                        <span className="text-xs text-emerald-600">File uploaded</span>
                        <button
                          type="button"
                          onClick={() => setNewQuizFiles((prev) => prev.filter((_, i) => i !== idx))}
                          className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 hover:underline"
                        >
                          <X className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    ))}
                    <label className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 text-sm">
                      <Upload className="w-4 h-4" />
                      {newQuizFiles.length ? "Add another file" : "Choose file (PDF, Word, Excel, PPT, text)"}
                      <input
                        type="file"
                        accept={ACCEPT_DOCUMENTS}
                        multiple
                        className="hidden"
                        onChange={async (e) => {
                          const list = e.target.files;
                          if (!list?.length) return;
                          setError("");
                          for (const file of Array.from(list)) {
                            const { text, error: extractError } = await extractDocumentText(file);
                            if (extractError) { setError(extractError); e.target.value = ""; return; }
                            setNewQuizFiles((prev) => [...prev, { name: file.name, content: text.slice(0, 50000) }]);
                          }
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateQuiz}
                    disabled={newQuizGenerating || (!newQuizTopics.trim() && !newQuizFileContent)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 text-sm"
                  >
                    {newQuizGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {newQuizGenerating ? "Generating…" : "Generate"}
                  </button>
                  {newQuizGeneratedPreview && (
                    <button
                      type="button"
                      onClick={handleGenerateQuiz}
                      disabled={newQuizGenerating}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Regenerate
                    </button>
                  )}
                </div>
                {newQuizGeneratedPreview && newQuizGeneratedPreview.length > 0 && (
                  <div className="rounded border border-slate-200 bg-white p-4 space-y-3">
                    <p className="text-sm font-medium text-slate-700">Preview (edit or delete as needed)</p>
                    {newQuizGeneratedPreview.map((qq, idx) => (
                      <div key={idx} className="p-3 rounded border border-slate-100 space-y-2">
                        <input
                          type="text"
                          value={qq.questionText}
                          onChange={(e) => {
                            const next = [...newQuizGeneratedPreview];
                            next[idx] = { ...next[idx], questionText: e.target.value };
                            setNewQuizGeneratedPreview(next);
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
                              const next = [...newQuizGeneratedPreview];
                              const opts = [...next[idx].options];
                              opts[oi] = e.target.value;
                              next[idx] = { ...next[idx], options: opts };
                              setNewQuizGeneratedPreview(next);
                            }}
                            placeholder={`Option ${oi + 1}`}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm"
                          />
                        ))}
                        <select
                          value={qq.correctAnswerIndex}
                          onChange={(e) => {
                            const next = [...newQuizGeneratedPreview];
                            next[idx] = { ...next[idx], correctAnswerIndex: Number(e.target.value) };
                            setNewQuizGeneratedPreview(next);
                          }}
                          className="px-3 py-1.5 border border-slate-200 rounded text-sm"
                        >
                          <option value={0}>Correct: Option 1</option>
                          <option value={1}>Correct: Option 2</option>
                          <option value={2}>Correct: Option 3</option>
                          <option value={3}>Correct: Option 4</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => setNewQuizGeneratedPreview((p) => (p ? p.filter((_, i) => i !== idx) : []))}
                          className="text-red-600 text-xs hover:underline"
                        >
                          Delete question
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-2">
                {newQuizQuestions.map((qq, idx) => (
                  <div key={idx} className="p-3 rounded border border-slate-200 bg-white space-y-2">
                    <input
                      type="text"
                      value={qq.questionText}
                      onChange={(e) => updateManualQuestion(idx, { questionText: e.target.value })}
                      placeholder="Question"
                      className="w-full px-3 py-2 border border-slate-200 rounded text-sm"
                    />
                    {qq.options.map((opt, oi) => (
                      <input
                        key={oi}
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const opts = [...qq.options];
                          opts[oi] = e.target.value;
                          updateManualQuestion(idx, { options: opts });
                        }}
                        placeholder={`Option ${oi + 1}`}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm"
                      />
                    ))}
                    <select
                      value={qq.correctAnswerIndex}
                      onChange={(e) => updateManualQuestion(idx, { correctAnswerIndex: Number(e.target.value) })}
                      className="px-3 py-1.5 border border-slate-200 rounded text-sm"
                    >
                      <option value={0}>Correct: Option 1</option>
                      <option value={1}>Correct: Option 2</option>
                      <option value={2}>Correct: Option 3</option>
                      <option value={3}>Correct: Option 4</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeManualQuestion(idx)}
                      className="text-red-600 text-xs hover:underline"
                    >
                      Remove question
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addManualQuestion}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  + Add question
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddQuiz(false);
                  setNewQuizTitle("");
                  setNewQuizNumberOfQuestions("10");
                  setNewQuizPassMark("");
                  setNewQuizTotalPoints("");
                  setNewQuizTopics("");
                  setNewQuizFiles([]);
                  setNewQuizQuestions([]);
                  setNewQuizGeneratedPreview(null);
                }}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addQuizPlaceholder}
                disabled={!newQuizTitle.trim()}
                className="px-3 py-1.5 text-sm bg-teal-600 text-white rounded-lg disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddQuiz(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Quiz
          </button>
        )}
      </div>

      {/* Assignments — after quizzes, no dues, pass criteria. Manual or AI. */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-2">
          <FileTextIcon className="w-5 h-5 text-teal-600" />
          Assignments
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Add assignments. Choose manual (write description) or AI (generate from prompt). Set pass criteria. No due dates when created here.
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
                <input
                  type="radio"
                  checked={newAssessmentMode === "manual"}
                  onChange={() => setNewAssessmentMode("manual")}
                  className="rounded"
                />
                Manual
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={newAssessmentMode === "ai"}
                  onChange={() => setNewAssessmentMode("ai")}
                  className="rounded"
                />
                AI
              </label>
            </div>
            {newAssessmentMode === "manual" ? (
              <textarea
                value={newAssessmentDescription}
                onChange={(e) => setNewAssessmentDescription(e.target.value)}
                placeholder="Assignment description / instructions *"
                rows={4}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm"
              />
            ) : (
              <>
                <textarea
                  value={newAssessmentTopicsPrompt}
                  onChange={(e) => setNewAssessmentTopicsPrompt(e.target.value)}
                  placeholder="Prompt to generate assignment (e.g. topic, requirements, rubric)"
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
                        <button
                          type="button"
                          onClick={() => setNewAssessmentFiles((prev) => prev.filter((_, i) => i !== idx))}
                          className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 hover:underline"
                        >
                          <X className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    ))}
                    <label className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 text-sm">
                      <Upload className="w-4 h-4" />
                      {newAssessmentFiles.length ? "Add another file" : "Choose file (PDF, Word, Excel, PPT, text)"}
                      <input
                        type="file"
                        accept={ACCEPT_DOCUMENTS}
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setError("");
                          const { text, error: extractError } = await extractDocumentText(file);
                          if (extractError) { setError(extractError); e.target.value = ""; return; }
                          setNewAssessmentFiles((prev) => [...prev, { name: file.name, content: text.slice(0, 50000) }]);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateAssignment}
                    disabled={newAssessmentGenerating || (!newAssessmentTopicsPrompt.trim() && !newAssessmentFileContent)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 text-sm"
                  >
                    {newAssessmentGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {newAssessmentGenerating ? "Generating…" : "Generate"}
                  </button>
                  {newAssessmentGeneratedPreview && (
                    <button
                      type="button"
                      onClick={handleGenerateAssignment}
                      disabled={newAssessmentGenerating}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Regenerate
                    </button>
                  )}
                </div>
                {newAssessmentGeneratedPreview && (
                  <div className="rounded border border-slate-200 bg-white p-4">
                    <p className="text-sm font-medium text-slate-700 mb-2">Preview (edit as needed)</p>
                    <textarea
                      value={newAssessmentGeneratedPreview}
                      onChange={(e) => setNewAssessmentGeneratedPreview(e.target.value)}
                      rows={8}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                )}
              </>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Pass mark</label>
                <input
                  type="number"
                  min={0}
                  value={newAssessmentPassMark}
                  onChange={(e) => setNewAssessmentPassMark(e.target.value)}
                  placeholder="e.g. 7"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Out of total</label>
                <input
                  type="number"
                  min={1}
                  value={newAssessmentTotalPoints}
                  onChange={(e) => setNewAssessmentTotalPoints(e.target.value)}
                  placeholder="e.g. 10"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddAssessment(false);
                  setNewAssessmentTitle("");
                  setNewAssessmentDescription("");
                  setNewAssessmentTopicsPrompt("");
                  setNewAssessmentFiles([]);
                  setNewAssessmentGeneratedPreview(null);
                  setNewAssessmentPassMark("");
                  setNewAssessmentTotalPoints("");
                }}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addAssessmentPlaceholder}
                disabled={!newAssessmentTitle.trim()}
                className="px-3 py-1.5 text-sm bg-teal-600 text-white rounded-lg disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddAssessment(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Assignment
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200">
        <Link
          href="/dashboard/instructor/courses"
          className="px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </Link>
        <button
          type="button"
          onClick={() => handleCreate("draft")}
          disabled={loading}
          className="px-4 py-2.5 border border-amber-600 text-amber-700 rounded-lg hover:bg-amber-50 disabled:opacity-50 flex items-center gap-2"
        >
          {loading && !loadingStep ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : loading && loadingStep ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {loadingStep}
            </>
          ) : (
            "Create Draft"
          )}
        </button>
        <button
          type="button"
          onClick={() => handleCreate("published")}
          disabled={loading}
          className="px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading && !loadingStep ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : loading && loadingStep ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {loadingStep}
            </>
          ) : (
            "Publish"
          )}
        </button>
      </div>
    </div>
  );
}
