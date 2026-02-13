"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  FileText,
  HelpCircle,
  X,
  Loader2,
  Sparkles,
} from "lucide-react";
import { pendingAssessments, ASSESSMENT_TYPES, ASSIGNMENT_SUBTYPES } from "@/data/instructorData";
import { useCanonicalStore } from "@/context/CanonicalStoreContext";
import type { Assignment } from "@/data/assignments";
import { ROLES as ASSIGNMENT_ROLES } from "@/data/assignments";
import type { QuizConfig } from "@/data/quizData";
import type { CanonicalCourse } from "@/data/canonicalCourses";
import { generateAssignmentFeedback as generateAssignmentFeedbackApi } from "@/lib/api/aiAssignmentFeedback";

function CreateAssessmentModal({
  courses,
  onClose,
  onCreated,
  addAssignment,
  addOrUpdateQuizConfig,
}: {
  courses: CanonicalCourse[];
  onClose: () => void;
  onCreated: () => void;
  addAssignment: (a: Assignment) => void;
  addOrUpdateQuizConfig: (q: QuizConfig) => void;
}) {
  const [createType, setCreateType] = useState<"assignment" | "quiz">("assignment");
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");
  const [role, setRole] = useState<Assignment["role"]>("Full Stack");
  const [type, setType] = useState<Assignment["type"]>("Coding");
  const [dueDateISO, setDueDateISO] = useState("");
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(15);
  const [passingScore, setPassingScore] = useState(70);
  const [attemptLimit, setAttemptLimit] = useState(2);
  const [description, setDescription] = useState("");

  const selectedCourse = courses.find((c) => c.id === courseId);
  const modules = selectedCourse?.modules ?? [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const course = courses.find((c) => c.id === courseId);
    const courseTitle = course?.title ?? "Course";
    const pathSlug = course?.pathSlug ?? "fullstack";
    const modTitle = (moduleTitle || modules.find((m) => m.id === moduleId)?.title) ?? "Module";
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
        dueDateISO: dueDateISO || new Date().toISOString().slice(0, 10),
        status: "Assigned",
        description: description.trim() || undefined,
      });
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
          )}
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

type PendingItem = (typeof pendingAssessments)[number] & { assignmentId?: string };

export default function InstructorAssessmentsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "assignments" | "quizzes" | "submissions">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [reviewItem, setReviewItem] = useState<PendingItem | null>(null);
  const [aiFeedbackText, setAiFeedbackText] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const {
    getAssignments,
    getQuizConfigs,
    getCoursesForInstructor,
    getAssignmentById,
    addAssignment,
    updateAssignment,
    addOrUpdateQuizConfig,
    refresh,
  } = useCanonicalStore();
  const assignments = getAssignments();
  const quizConfigs = getQuizConfigs();
  const courses = getCoursesForInstructor();

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

  const allAssessments = useMemo(() => {
    const list: { id: string; title: string; type: "assignment" | "quiz"; course: string; module: string; dueDate?: string }[] = [];
    assignments.forEach((a) => {
      list.push({
        id: a.id,
        title: a.title,
        type: "assignment",
        course: a.course,
        module: a.module,
        dueDate: a.dueDate,
      });
    });
    Object.values(quizConfigs).forEach((q) => {
      list.push({
        id: q.id,
        title: q.title,
        type: "quiz",
        course: q.course,
        module: q.module,
      });
    });
    return list;
  }, [assignments, quizConfigs]);

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
            {tab.id === "submissions" && pendingAssessments.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full text-xs">
                {pendingAssessments.length}
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

      {/* Sync note */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
        <p className="text-sm text-teal-800">
          <strong>Single source of truth:</strong> Assignments and quizzes created here appear in Learner → Assignments and inside the relevant course module. Completion updates course progress and readiness score.
        </p>
      </div>

      {/* Content by Tab */}
      {activeTab === "submissions" ? (
        /* Pending Reviews */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-amber-50/50">
            <h2 className="font-semibold text-slate-800">Submissions Awaiting Review</h2>
            <p className="text-sm text-slate-500 mt-1">
              Score assessments, provide feedback, and request rework
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingAssessments.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-lg ${item.type === "assignment" ? "bg-indigo-50" : "bg-purple-50"}`}>
                    {item.type === "assignment" ? (
                      <FileText className="w-5 h-5 text-indigo-600" />
                    ) : (
                      <HelpCircle className="w-5 h-5 text-purple-600" />
                    )}
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
                    {item.status === "submitted" ? "Awaiting Review" : "Auto-graded"}
                  </span>
                  <button
                    onClick={() => handleOpenReview(item as PendingItem)}
                    className="px-3 py-1.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* All / Assignments / Quizzes - Assessment List */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
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
                {allAssessments
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
                      <td className="py-4 px-4 text-center text-slate-600">—</td>
                      <td className="py-4 px-4 text-center text-slate-600">—</td>
                    </tr>
                  ))}
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
          onCreated={() => setShowCreateModal(false)}
          addAssignment={addAssignment}
          addOrUpdateQuizConfig={addOrUpdateQuizConfig}
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
