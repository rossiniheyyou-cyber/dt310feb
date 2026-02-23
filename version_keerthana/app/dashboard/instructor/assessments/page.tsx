"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  FileText,
  HelpCircle,
  X,
  Loader2,
  Sparkles,
} from "lucide-react";
import { ASSESSMENT_TYPES, ASSIGNMENT_SUBTYPES } from "@/data/instructorData";
import { useCanonicalStore } from "@/context/CanonicalStoreContext";
import type { Assignment } from "@/data/assignments";
import { ROLES as ASSIGNMENT_ROLES } from "@/data/assignments";
import type { QuizConfig } from "@/data/quizData";
import type { CanonicalCourse } from "@/data/canonicalCourses";
import { generateAssignmentFeedback as generateAssignmentFeedbackApi } from "@/lib/api/aiAssignmentFeedback";
import { createAssessment } from "@/lib/api/calendar";
import {
  getInstructorSubmissions,
  getInstructorAssessments,
  type InstructorSubmissionItem,
  type InstructorAssessmentItem,
} from "@/lib/api/instructor";

function CreateAssessmentModal({
  courses,
  onClose,
  onCreated,
  addAssignment,
  addOrUpdateQuizConfig,
  initialCourseId,
}: {
  courses: CanonicalCourse[];
  onClose: () => void;
  onCreated: () => void;
  addAssignment: (a: Assignment) => void;
  addOrUpdateQuizConfig: (q: QuizConfig) => void;
  initialCourseId?: string;
}) {
  const [createType, setCreateType] = useState<"assignment" | "quiz">("assignment");
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState(initialCourseId ?? "");

  useEffect(() => {
    if (initialCourseId) setCourseId(initialCourseId);
  }, [initialCourseId]);
  const [moduleId, setModuleId] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");
  const [role, setRole] = useState<Assignment["role"]>("Full Stack");
  const [type, setType] = useState<Assignment["type"]>("Coding");
  const [dueDateISO, setDueDateISO] = useState("");
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(15);
  const [passingScore, setPassingScore] = useState(70);
  const [attemptLimit, setAttemptLimit] = useState(2);
  const [quizDueDateISO, setQuizDueDateISO] = useState("");
  const [description, setDescription] = useState("");
  const [publishNow, setPublishNow] = useState(true);

  const selectedCourse = courses.find((c) => c.id === courseId);
  const modules = selectedCourse?.modules ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const course = courses.find((c) => c.id === courseId);
    const courseTitle = course?.title ?? "Course";
    const pathSlug = course?.pathSlug ?? "fullstack";
    const modTitle = (moduleTitle || modules.find((m) => m.id === moduleId)?.title) ?? "Module";
    const resolvedDueDateISO = dueDateISO || new Date().toISOString().slice(0, 10);
    const dueDate = dueDateISO ? new Date(dueDateISO).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";

    if (createType === "assignment") {
      const id = `a-${Date.now()}`;
      addAssignment({
        id,
        title: title.trim(),
        course: courseTitle,
        courseId: courseId || id,
        pathSlug,
        module: modTitle,
        moduleId: moduleId || "m1",
        role,
        type,
        dueDate,
        dueDateISO: resolvedDueDateISO,
        status: "Assigned",
        description: description.trim() || undefined,
      });
      // Persist to backend for calendar visibility across all users
      try {
        const backendCourseId = course?.backendId ?? (courseId && /^\d+$/.test(String(courseId)) ? courseId : undefined);
        await createAssessment({
          title: title.trim(),
          courseId: backendCourseId ? String(backendCourseId) : undefined,
          courseTitle,
          pathSlug,
          module: modTitle,
          moduleId: moduleId || id,
          type: "assignment",
          dueDateISO: resolvedDueDateISO,
          status: publishNow ? "published" : "draft",
        });
      } catch (err) {
        console.warn("Calendar assessment not created (backend may be unavailable):", err);
      }
    } else {
      const id = `q-${Date.now()}`;
      addOrUpdateQuizConfig({
        id,
        assignmentId: id,
        title: title.trim(),
        course: courseTitle,
        module: modTitle,
        questionCount: 0,
        timeLimitMinutes,
        passingScore,
        attemptLimit,
        instructions: [],
        questions: [],
      });
      const quizDueISO = quizDueDateISO || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      try {
        const backendCourseId = course?.backendId ?? (courseId && /^\d+$/.test(String(courseId)) ? courseId : undefined);
        await createAssessment({
          title: title.trim(),
          courseId: backendCourseId ? String(backendCourseId) : undefined,
          courseTitle,
          pathSlug,
          module: modTitle,
          moduleId: moduleId || id,
          type: "quiz",
          dueDateISO: quizDueISO,
          status: publishNow ? "published" : "draft",
        });
      } catch (err) {
        console.warn("Calendar assessment not created (backend may be unavailable):", err);
      }
    }
    onCreated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">Create Assessment</h2>
          <p className="text-sm text-slate-500 mt-1">
            Assignments and quizzes appear in Learner → Assignments and in the course module. Completion updates progress and readiness.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Assessment Type</label>
            <select
              value={createType}
              onChange={(e) => setCreateType(e.target.value as "assignment" | "quiz")}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="assignment">Assignment</option>
              <option value="quiz">Quiz</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={createType === "assignment" ? "e.g., Build REST API" : "e.g., Module Quiz"}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Course</label>
              <select
                value={courseId}
                onChange={(e) => {
                  setCourseId(e.target.value);
                  setModuleId("");
                  setModuleTitle("");
                }}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select course</option>
                {courses.filter((c) => c.status === "published" || c.status === "draft").map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Module</label>
              <select
                value={moduleId}
                onChange={(e) => {
                  const m = modules.find((x) => x.id === e.target.value);
                  setModuleId(e.target.value);
                  setModuleTitle(m?.title ?? "");
                }}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select module</option>
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>
          </div>
          {createType === "assignment" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Assignment["role"])}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {ASSIGNMENT_ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as Assignment["type"])}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {ASSIGNMENT_SUBTYPES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDateISO}
                  onChange={(e) => setDueDateISO(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </>
          )}
          {createType === "quiz" && (
            <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Due Date (for calendar)</label>
              <input
                type="date"
                value={quizDueDateISO}
                onChange={(e) => setQuizDueDateISO(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Time Limit (min)</label>
                <input
                  type="number"
                  value={timeLimitMinutes}
                  onChange={(e) => setTimeLimitMinutes(Number(e.target.value) || 15)}
                  min={1}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pass %</label>
                <input
                  type="number"
                  value={passingScore}
                  onChange={(e) => setPassingScore(Number(e.target.value) || 70)}
                  min={0}
                  max={100}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Attempt Limit</label>
                <input
                  type="number"
                  value={attemptLimit}
                  onChange={(e) => setAttemptLimit(Number(e.target.value) || 2)}
                  min={1}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            </>
          )}
          <div className="flex items-center gap-2 py-2">
            <input
              type="checkbox"
              id="publish-now"
              checked={publishNow}
              onChange={(e) => setPublishNow(e.target.checked)}
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <label htmlFor="publish-now" className="text-sm text-slate-700">
              Publish now (visible to enrolled learners; uncheck to save as draft)
            </label>
          </div>
          <div className="p-6 border-t border-slate-200 flex justify-end gap-3 -mx-6 -mb-6 px-6 pb-6 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              Create {createType === "assignment" ? "Assignment" : "Quiz"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type PendingItem = InstructorSubmissionItem;

export default function InstructorAssessmentsPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"all" | "assignments" | "quizzes" | "submissions">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [reviewItem, setReviewItem] = useState<PendingItem | null>(null);
  const [aiFeedbackText, setAiFeedbackText] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [realQuizSubmissions, setRealQuizSubmissions] = useState<InstructorSubmissionItem[]>([]);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<InstructorSubmissionItem[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [apiAssessments, setApiAssessments] = useState<InstructorAssessmentItem[]>([]);
  const [assessmentsLoading, setAssessmentsLoading] = useState(false);
  const {
    getCoursesForInstructor,
    getAssignmentById,
    addAssignment,
    updateAssignment,
    addOrUpdateQuizConfig,
    refresh,
  } = useCanonicalStore();
  const courses = getCoursesForInstructor();

  // Prefill and open create modal when coming from course editor (create=true&courseId=...)
  const urlCreate = searchParams.get("create") === "true";
  const urlCourseId = searchParams.get("courseId") ?? "";
  const resolvedCourseId = urlCourseId
    ? (courses.find((c) => c.id === urlCourseId || String(c.backendId) === urlCourseId)?.id ?? urlCourseId)
    : "";

  useEffect(() => {
    if (urlCreate && urlCourseId) setShowCreateModal(true);
  }, [urlCreate, urlCourseId]);

  const fetchSubmissions = useCallback(async () => {
    setSubmissionsLoading(true);
    try {
      const data = await getInstructorSubmissions();
      setRealQuizSubmissions(data.quizAttempts || []);
      setAssignmentSubmissions(data.assignmentSubmissions || []);
    } catch {
      setRealQuizSubmissions([]);
      setAssignmentSubmissions([]);
    } finally {
      setSubmissionsLoading(false);
    }
  }, []);

  const fetchAssessments = useCallback(async () => {
    setAssessmentsLoading(true);
    try {
      const data = await getInstructorAssessments();
      setApiAssessments(data.assessments || []);
    } catch {
      setApiAssessments([]);
    } finally {
      setAssessmentsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  useEffect(() => {
    if (activeTab !== "submissions") return;
    fetchSubmissions();
    const interval = setInterval(fetchSubmissions, 30000);
    return () => clearInterval(interval);
  }, [activeTab, fetchSubmissions]);

  const handleOpenReview = (item: PendingItem) => {
    setReviewItem(item);
    const assignment = "assignmentId" in item && item.assignmentId ? getAssignmentById(item.assignmentId) : null;
    setAiFeedbackText(assignment?.aiFeedback ?? "");
  };

  const handleGenerateAiFeedback = async () => {
    if (!reviewItem) return;
    const assignment = "assignmentId" in reviewItem && reviewItem.assignmentId ? getAssignmentById(reviewItem.assignmentId) : null;
    setFeedbackLoading(true);
    try {
      const { feedback } = await generateAssignmentFeedbackApi({
        assignmentTitle: reviewItem.title,
        assignmentDescription: assignment?.description ?? "",
        submissionContent: `[Submission by ${reviewItem.learnerName} for ${reviewItem.course}]\n\nPlaceholder: Intern submitted their work. Review the submission and provide constructive feedback.`,
      });
      setAiFeedbackText(feedback);
    } catch (e) {
      console.error("Failed to generate AI feedback", e);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleSaveFeedbackToAssignment = () => {
    if (!reviewItem || !("assignmentId" in reviewItem) || !reviewItem.assignmentId) return;
    setSaveLoading(true);
    try {
      updateAssignment(reviewItem.assignmentId, { aiFeedback: aiFeedbackText, status: "Reviewed" });
      refresh();
      setReviewItem(null);
    } finally {
      setSaveLoading(false);
    }
  };

  const pendingCount = realQuizSubmissions.length + assignmentSubmissions.length;

  const tabs = [
    { id: "all" as const, label: "All Assessments" },
    { id: "assignments" as const, label: "Assignments" },
    { id: "quizzes" as const, label: "Quizzes" },
    { id: "submissions" as const, label: "Pending Reviews" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Assessments</h1>
          <p className="text-slate-500 mt-1">Assignments and quizzes — unified evaluation</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition"
        >
          <Plus className="w-5 h-5" />
          Create Assessment
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              activeTab === tab.id
                ? "bg-teal-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab.label}
            {tab.id === "submissions" && pendingCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full text-xs">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search assessments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Content by Tab */}
      {activeTab === "submissions" ? (
        /* Quiz & assignment submissions — real-time from backend + placeholder assignments */
        <div className="rounded-2xl card-gradient border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
          <div className="p-4 border-b border-slate-200 bg-amber-50/50 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="font-semibold text-slate-800">Quiz & Assignment Submissions</h2>
              <p className="text-sm text-slate-500 mt-1">
                Live data from your courses. Quiz attempts are auto-graded; assignments can be reviewed below. Refreshes every 30s.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchSubmissions}
              disabled={submissionsLoading}
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {submissionsLoading ? "Loading…" : "Refresh now"}
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {realQuizSubmissions.length === 0 && assignmentSubmissions.length === 0 && !submissionsLoading ? (
              <div className="p-8 text-center text-slate-500">
                <p>No submissions yet.</p>
                <p className="text-sm mt-1">When learners submit quizzes or assignments, they will appear here.</p>
              </div>
            ) : (
              <>
                {realQuizSubmissions.map((item) => (
                  <div
                    key={`quiz-${item.id}`}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-lg bg-purple-50">
                        <HelpCircle className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{item.title}</p>
                        <p className="text-sm text-slate-500">
                          {item.learnerName} • {item.course}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Submitted {new Date(item.submittedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        Auto-graded
                      </span>
                      {item.score != null && item.totalQuestions != null && (
                        <span className="text-sm font-medium text-slate-700">
                          Score: {item.score}/{item.totalQuestions}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {assignmentSubmissions.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-lg bg-indigo-50">
                        <FileText className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{item.title}</p>
                        <p className="text-sm text-slate-500">
                          {item.learnerName} • {item.course}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Submitted {new Date(item.submittedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.status === "submitted" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {item.status === "submitted" ? "Awaiting Review" : "Reviewed"}
                      </span>
                      {item.status === "submitted" && (
                        <button
                          onClick={() => handleOpenReview(item)}
                          className="px-3 py-1.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition"
                        >
                          Review
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      ) : (
        /* All / Assignments / Quizzes - Assessment List */
        <div className="rounded-2xl card-gradient border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Assessment</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Type</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Course / Module</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Due Date</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-slate-700">Submissions</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-slate-700">Reviewed</th>
                </tr>
              </thead>
              <tbody>
                {assessmentsLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 px-4 text-center text-slate-500">
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Loading assessments…
                      </span>
                    </td>
                  </tr>
                ) : (
                  apiAssessments
                    .filter(
                      (a) =>
                        activeTab === "all" ||
                        (activeTab === "assignments" && a.type === "assignment") ||
                        (activeTab === "quizzes" && a.type === "quiz")
                    )
                    .filter(
                      (a) =>
                        !searchQuery.trim() ||
                        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        a.course.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .slice(0, 20)
                    .map((a) => (
                      <tr key={`${a.type}-${a.id}`} className="border-b border-slate-100 last:border-none hover:bg-slate-50 transition">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            {a.type === "quiz" ? (
                              <HelpCircle className="w-5 h-5 text-purple-500" />
                            ) : (
                              <FileText className="w-5 h-5 text-indigo-500" />
                            )}
                            <div>
                              <p className="font-medium text-slate-800">{a.title}</p>
                              <p className="text-xs text-slate-500">{a.type}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            a.type === "quiz" ? "bg-purple-100 text-purple-700" : "bg-indigo-100 text-indigo-700"
                          }`}>
                            {a.type === "quiz" ? "Quiz" : "Assignment"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-600">
                          {a.course} / {a.module}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-600">{a.dueDate ?? "—"}</td>
                        <td className="py-4 px-4 text-center text-slate-600">{a.submissions}</td>
                        <td className="py-4 px-4 text-center text-slate-600">{a.reviewed}</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Assessment Modal */}
      {showCreateModal && (
        <CreateAssessmentModal
          courses={courses}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            fetchAssessments();
          }}
          addAssignment={addAssignment}
          addOrUpdateQuizConfig={addOrUpdateQuizConfig}
          initialCourseId={resolvedCourseId}
        />
      )}

      {/* Review submission modal — AI feedback */}
      {reviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Review submission</h2>
              <button
                onClick={() => setReviewItem(null)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="font-medium text-slate-800">{reviewItem.title}</p>
                <p className="text-sm text-slate-500">
                  {reviewItem.learnerName} • {reviewItem.course}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Submitted {new Date(reviewItem.submittedAt).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs font-medium text-slate-500 mb-1">Submission (placeholder)</p>
                <p className="text-sm text-slate-700">
                  Intern submitted their work for review. Use &quot;Generate AI feedback&quot; to get suggested feedback based on the assignment and submission context.
                </p>
              </div>
              {reviewItem.type === "assignment" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">AI feedback</label>
                    <textarea
                      value={aiFeedbackText}
                      onChange={(e) => setAiFeedbackText(e.target.value)}
                      placeholder="Generate AI feedback or type your own..."
                      rows={5}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleGenerateAiFeedback}
                      disabled={feedbackLoading}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
                    >
                      {feedbackLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                      Generate AI feedback
                    </button>
                    {"assignmentId" in reviewItem && reviewItem.assignmentId && (
                      <button
                        onClick={handleSaveFeedbackToAssignment}
                        disabled={saveLoading || !aiFeedbackText.trim()}
                        className="inline-flex items-center gap-2 px-4 py-2.5 border border-teal-600 text-teal-700 text-sm font-medium rounded-lg hover:bg-teal-50 transition disabled:opacity-50"
                      >
                        {saveLoading ? <Loader2 size={18} className="animate-spin" /> : null}
                        Save to assignment
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Saving feedback updates the assignment and marks it as Reviewed. The learner will see this feedback on their assignment page.
                  </p>
                </>
              )}
              {reviewItem.type === "quiz" && (
                <p className="text-sm text-slate-600">This quiz was auto-graded. No feedback needed.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
